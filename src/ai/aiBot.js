/**
 * Created by whyask37 on 2017. 1. 23..
 */

"use strict";


const cmdproc = require("../server/io/cmdproc");
const mutils = require('../server/logic/mutils');
const _ = require('underscore');
const RL = require('./rl').RL;

const gameEnvSize = 311;

// AI Agent for drawing cards
const aiEnv = {
    getNumStates: () => 311 + 5 + 53,
    getMaxNumActions: () => 10
};
const aiSpec = {
    alpha: 0.01
};
const aiMap = new RL.DQNAgent(aiEnv, aiSpec);


////////////////////////////////////////////////////////////////////////////////////////


function AIBot(room, userEntry) {
    "use strict";

    this.room = room;
    this.userEntry = userEntry;
    this.gameUsers = [];
    this.deck = null;
    this.playedCards = [];
    this.shouldLog = (this.userEntry.useridf == 'AI0');

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
};

AIBot.prototype.proc_deck = function (msg) {
    this.deck = msg.deck;
    if(this.shouldLog) console.log('deck', this.userEntry.useridf, msg.deck);
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

    // 문양 요청시
    if(msg.shaperq) {
        let sStart = null, sEnd = null;
        for(let i = 0 ; i < deck.length ; i++) {
            if(deck[i].shape == msg.shaperq) {
                if(sStart === null) sStart = i;
                sEnd = i;
            }
        }
        if(sStart !== null) {
            this.cmd({
                type: 'cp',
                cardIdx: _.random(sStart, sEnd)
            });
            return;
        }
    }

    let cardIdx;
    while(true) {
        cardIdx =  _.random(0, deck.length - 1);
        // 못 내는 카드
        if(!this.room.canPlayCard(deck[cardIdx])) {
            continue;
        }
        this.cmd({
            type: 'cp',
            cardIdx: cardIdx
        });
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
};
