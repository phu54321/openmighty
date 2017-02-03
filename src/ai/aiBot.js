/**
 * Created by whyask37 on 2017. 1. 25..
 */

/**
 * Created by whyask37 on 2017. 1. 23..
 */

"use strict";

const gameenv = require('./gameenv');
const cmdproc = require("../server/io/cmdproc");
const _ = require('underscore');

/////////////////////////////

const math = require('mathjs');
const mainModel = require('./models/modelMain');
const bidderModel = require('./models/modelBidder');
const isHigherBid = require('../server/logic/bidding').isHigherBid;

////////////////////////////////////////////////////////////////////////////////////////



function AIBot(room, userEntry) {
    "use strict";

    this.room = room;
    this.userEntry = userEntry;
    this.gameUsers = [];
    this.deck = null;
    this.playedCards = [];

    this.selfIndexEncoding = gameenv.createZeroArray(5);
    this.deckEncoding = gameenv.createZeroArray(53);
    this.shouldLog = (userEntry.useridf == 'AI0');
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
    setTimeout(() => {
        const badCommand = [];
        const mthName = 'proc_' + msg.type;
        if (this[mthName]) return this[mthName](msg);
        else if(badCommand.indexOf(msg.type) != -1) {
            this.cmd({ type: 'abort' });
        }
    }, 800);
};

exports = module.exports = AIBot;


///////////////////////////////////////////////
//// AI Handler


// Ignored actions

AIBot.prototype.proc_gusers = function(msg) {
    this.bidded = false;
    // if(!this.shouldLog && !this.training) console.log('gusers', msg);
    for(let i = 0 ; i < 5 ; i++) {
        if(msg.users[i].useridf == this.userEntry.useridf) {
            gameenv.applyOneHotEncoding(this.selfIndexEncoding, 5, i);
            this.selfIndex = i;
            break;
        }
    }
};

AIBot.prototype.proc_deck = function (msg) {
    this.deck = msg.deck;
    // if(!this.training && this.shouldLog) console.log('deck', this.userEntry.useridf, msg.deck);
    this.deckEncoding.fill(0);
    msg.deck.forEach((card) => {
        this.deckEncoding[card.cardEnvID] = 1;
    });
};


AIBot.prototype.proc_bidrq = function () {
    this.cmd({
        type: 'bid',
        shape: 'pass'
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

    // 잘 모르겠고, 버릴 카드를 선택한다.

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
    this.failedTry = 0;
};


//////////////////////////////////////////////////

AIBot.prototype.getGameState = function () {
    const env = this.room.gameEnv.getEnvArray();
    return env.concat(
        this.selfIndexEncoding,
        this.deckEncoding
    );
};


AIBot.prototype.proc_cprq = function(msg) {
    const room = this.room;
    const deck = this.deck;
    const bot = this;

    // 조커 콜 처리
    if (msg.jcall && deck.hasShape('joker')) msg.shaperq = 'joker';
    const gameState = this.getGameState();
    const cardIdxV = mainModel.forward(gameState);
    for (let i = 0; i < 10; i++) {
        const cardIdx = cardIdxV[i];
        if (cardIdx >= deck.length || !room.canPlayCard(deck[cardIdx])) continue;
        // console.log(cardIdx, cardIdxV, deck[cardIdx])
        // console.log(this.deck);
        bot.cmd({
            type: 'cp',
            cardIdx: cardIdx
        });
        break;
    }
};

AIBot.prototype.proc_pcp = function(msg) {
    this.playedCards.push(msg.card);
};

AIBot.prototype.proc_tend = function() {
    // console.log('----------------------------');
    this.playedCards = [];
};
