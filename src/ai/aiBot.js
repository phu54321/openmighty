/**
 * Created by whyask37 on 2017. 1. 23..
 */

"use strict";

const gameenv = require('./gameenv');
const cmdproc = require("../server/io/cmdproc");
const mutils = require('../server/logic/mutils');
const _ = require('underscore');
const RL = require('./rl').RL;
const assert = require('assert');

const gameEnvSize = 312;

// AI Agent for drawing cards
const aiEnv = {
    getNumStates: () => gameEnvSize + 5 + 53,
    getMaxNumActions: () => 10
};
const aiSpec = {
    gamma: 0.95,
    alpha: 0.01,
    epsilon: 0.2,
};


////////////////////////////////////////////////////////////////////////////////////////


function AIBot(room, userEntry) {
    "use strict";

    this.room = room;
    this.userEntry = userEntry;
    this.gameUsers = [];
    this.deck = null;
    this.playedCards = [];
    this.shouldLog = (this.userEntry.useridf == 'AI0');

    this.selfIndexEncoding = gameenv.createZeroArray(5);
    this.deckEncoding = gameenv.createZeroArray(53);
    this.aiMap = new RL.DQNAgent(aiEnv, aiSpec);

    console.log('Started', userEntry.useridf);
}

/**
 * cmd 액션을 게임에 전달합니다.
 * @param msg
 * @returns {boolean}
 */
AIBot.prototype.cmd = function (msg) {
    "use strict";
    // if(this.shouldLog) console.log('[Out]', this.userEntry.useridf, msg);

    const cmdProcessor = cmdproc[msg.type];
    if(!cmdProcessor) {
        // console.log('[' + this.userEntry.useridf + '] Unknown command : ' + msg.type);
        return false;
    }
    // console.log('[' + this.userEntry.useridf + ' Out]', msg);
    return cmdProcessor(this, this.room, this.userEntry, msg);
};


/**
 * socket.emit랑 비슷한 역할을 합니다 메세지를 전달받습니다.
 */
AIBot.prototype.emit = function (type, msg) {
    "use strict";
    // if(type == 'err' || this.shouldLog) console.log('[In]', type, this.userEntry.useridf, msg);

    if(type == 'cmd') {
        this.onCommand(msg);
    }
    else if(type == 'err') {
        this.cmd({ type: 'stop' });
    }
};

/**
 * 게임에서 받은 cmd를 처리합니다.
 * @param msg
 */
AIBot.prototype.onCommand = function (msg) {
    process.nextTick(() => {
        const badCommand = ['d3rq', 'fsrq'];
        const mthName = 'proc_' + msg.type;
        if (this[mthName]) return this[mthName](msg);
        else if(badCommand.indexOf(msg.type) != -1) {
            this.cmd({ type: 'abort' });
        }
    });
};

module.exports = AIBot;


///////////////////////////////////////////////
//// AI Handler


// Ignored actions

AIBot.prototype.proc_gusers = function(msg) {
    this.bidded = false;
    for(let i = 0 ; i < 5 ; i++) {
        if(msg.useridf == this.userEntry.useridf) {
            gameenv.applyOneHotEncoding(this.selfIndexEncoding, 5, i);
            this.selfIndex = i;
            break;
        }
    }
};

AIBot.prototype.proc_deck = function (msg) {
    this.deck = msg.deck;
    if(this.shouldLog) console.log('deck', this.userEntry.useridf, msg.deck);
    this.deckEncoding.fill(0);
    msg.deck.forEach((card) => {
        this.deckEncoding[card.cardEnvID] = 1;
    });
};

AIBot.prototype.getGameState = function (msg) {
    const env = this.room.gameEnv.getEnvArray();
    return env.concat(
        this.selfIndexEncoding,
        this.deckEncoding
    );
};

AIBot.prototype.proc_pbinfo = function (msg) {
    if(msg.shape != 'pass') this.bidded = true;
};


AIBot.prototype.proc_bidrq = function () {
    // 내가 A랑 K랑 있고 해당 문양 4장이 있으면 13을 부른다.
    if(this.bidded) {
        this.cmd({
            type: 'bid',
            shape: 'pass'
        });
        return;
    }

    const cardsByShape =_.groupBy(this.deck, (card) => card.shape);
    let bidShape = 'pass';
    _.keys(cardsByShape).forEach((shape) => {
        const shapeDeck = cardsByShape[shape];
        if(
            shapeDeck.length >= 4 &&
            shapeDeck[0].num == 14
        ) {
            bidShape = shape;
        }
    });
    if(bidShape != 'pass') console.log(this.userEntry.useridf, bidShape);
    this.cmd({
        type: 'bid',
        shape: bidShape,
        num: 13
    });
};

AIBot.prototype.proc_bc1rq = function () {
    this.cmd({
        type: 'bc1',
        shape: 'pass'
    });
};

AIBot.prototype.proc_fsrq = function () {
    const room = this.room;
    const mightyShape = (this.bidShape == 'spade') ? 'diamond' : 'spade';

    // 버릴 카드 선택
    // 기루다 빼고 암거나 버리자.
    const nonGiruda = [];
    for(let i = 0 ; i < 13 ; i++) {
        const card = this.deck[i];
        if(
            card.shape != room.bidShape &&
            !(card.shape == mightyShape && card.num == 14) &&
            card.shape !== 'joker'
        ) nonGiruda.push(i);
    }

    let discards;
    if(nonGiruda.length >= 3) {
        discards = _.sample(nonGiruda, 3);
    }
    else {
        if(this.deck[9].shape == 'joker') discards = [6, 7, 8];
        else discards = [7, 8, 9];
    }

    this.cmd({
        type: 'fs',
        ftype: 'card',
        discards: discards,
        shape: mightyShape,
        num: 14
    });
};


AIBot.prototype.proc_binfo = function () {
    this.playedCards = [];
};

AIBot.prototype.proc_cprq = function(msg) {
    const deck = this.deck;

    // 조커 콜 처리
    if(msg.jcall && mutils.hasShapeOnDeck('joker', deck)) msg.shaperq = 'joker';

    // 그 외엔 알아서
    const gameState = this.getGameState();

    let cardIdx;
    while(true) {
        cardIdx = this.aiMap.act(gameState);
        // 못 내는 카드
        if(cardIdx >= deck.length || !this.room.canPlayCard(deck[cardIdx])) {
            this.aiMap.learn(-5);
            continue;
        }
        this.cmd({
            type: 'cp',
            cardIdx: cardIdx
        });
        if(this.room.currentTrick < 10)
            this.aiMap.learn(0);
        break;
    }
};

AIBot.prototype.proc_pcp = function(msg) {
    if(this.shouldLog) console.log('pcp', msg.player, msg.card.shape, msg.card.num);
    this.playedCards.push(msg.card);
};

AIBot.prototype.proc_tend = function() {
    this.playedCards = [];
    if(this.shouldLog) console.log('---------- trick end');
};

AIBot.prototype.proc_gend = function (msg) {
    if(this.shouldLog) console.log(msg);
    this.aiMap.learn(msg.scores[this.selfIndex]);
    if(this.onEnd) this.onEnd();
};

AIBot.prototype.proc_gabort = function (msg) {
    if(this.shouldLog) console.log(msg);
    if(this.onEnd) this.onEnd();
};
