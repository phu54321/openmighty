/**
 * Created by whyask37 on 2017. 1. 23..
 */

"use strict";

const gameenv = require('./gameenv');
const cmdproc = require("../server/io/cmdproc");
const mutils = require('../server/logic/mutils');
const _ = require('underscore');
const assert = require('assert');
const path = require('path');
const isHigherBid = require('../server/logic/bidding').isHigherBid;


const spawn = require('child_process').spawn;
const agentMain = spawn('python', ['aimain/agent.py']);
let onCommand = null;

agentMain.stdout.on('data', (data) => {
    data = data.toString();
    // console.log('[IN]', data.charCodeAt(0));
    onCommand(data.charCodeAt(0));
    onCommand = null;
});

agentMain.stderr.pipe(process.stdout);

agentMain.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});

function sendAgent(msg, cb) {
    if(cb) onCommand = cb;
    // console.log('[OUT]', msg);
    agentMain.stdin.write(JSON.stringify(msg) + '\n');
}

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
    this.shouldLog = false; // (userEntry.useridf == 'AI0');

    sendAgent({type: 'create', aiIdf: userEntry.useridf});
}


/**
 * cmd 액션을 게임에 전달합니다.
 * @param msg
 * @returns {boolean}
 */
AIBot.prototype.cmd = function (msg) {
    "use strict";
    if(this.shouldLog) console.log('[Out]', this.userEntry.useridf, msg);

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
    if(type == 'err' || this.shouldLog) console.log('[In]', type, this.userEntry.useridf, msg);

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

exports = module.exports = AIBot;


///////////////////////////////////////////////
//// AI Handler


// Ignored actions

AIBot.prototype.proc_gusers = function(msg) {
    if(!this.shouldLog && !this.training) console.log('gusers', msg);
    for(let i = 0 ; i < 5 ; i++) {
        if(msg.users[i].useridf == this.userEntry.useridf) {
            gameenv.applyOneHotEncoding(this.selfIndexEncoding, 5, i);
            this.selfIndex = i;
            break;
        }
    }
    this.bidID = null;
};

AIBot.prototype.proc_deck = function (msg) {
    this.deck = msg.deck;
    if(!this.training && this.shouldLog) console.log('deck', this.userEntry.useridf, msg.deck);
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


AIBot.prototype.proc_bidrq = function () {
    if(this.bidID !== null) {
        this.cmd({
            type: 'bid',
            shape: 'pass'
        });
        return;
    }

    // 내가 A랑 K랑 있고 해당 문양 4장이 있으면 13을 부른다.
    const aiIdf = this.userEntry.useridf;
    const bot = this;

    if (Math.random() < exploreFactor) onBidSelect(_.random(0, 40));
    else {
        sendAgent({
            type: 'bidpredict',
            aiIdf: aiIdf,
            deck: this.deckEncoding
        }, onBidSelect);
    }

    function onBidSelect(bidID) {
        bot.bidID = bidID;

        let bidShape, bidCount;
        if (bidID == 40) {
            bidShape = 'pass';
            bidCount = 0;
        }
        else {
            bidShape = mutils.bidShapes[(bidID / 8) | 0];
            bidCount = bidID % 8 + 13;
        }

        const bidding = bot.room.bidding;
        const lastBidShape = bidding.lastBidShape || 'none';
        const lastBidCount = bidding.lastBidCount || 12;

        if (bidShape != 'pass' && isHigherBid(
                lastBidShape, lastBidCount,
                bidShape, bidCount
            )) {
            bot.cmd({
                type: 'bid',
                shape: bidShape,
                num: bidCount
            });
        }
        else {
            bot.cmd({
                type: 'bid',
                shape: 'pass'
            });
        }
    }
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

const exploreFactor = 0.05;

AIBot.prototype.proc_cprq = function(msg) {
    const room = this.room;
    const deck = this.deck;
    const bot = this;
    const aiIdf = bot.userEntry.useridf;

    // 조커 콜 처리
    if(msg.jcall && mutils.hasShapeOnDeck('joker', deck)) msg.shaperq = 'joker';
    const gameState = this.getGameState();

    playCard();

    function playCard() {
        sendAgent({
            type: 'setstate',
            aiIdf: aiIdf,
            state: gameState
        });

        if (Math.random() < exploreFactor) onCardSelect(_.random(0, 9));
        else {
            sendAgent({
                type: 'predict',
                aiIdf: aiIdf
            }, onCardSelect);
        }

        function onCardSelect(cardIdx) {
            // 못 내는 카드
            sendAgent({
                type: 'action',
                aiIdf: aiIdf,
                action: cardIdx
            });
            if(cardIdx >= deck.length || !room.canPlayCard(deck[cardIdx])) {
                if(bot.training) {
                    sendAgent({
                        type: 'reward',
                        aiIdf: aiIdf,
                        reward: -1,  // Basic penalty
                    });
                }
                bot.failedTry++;
                process.nextTick(playCard);
                return;
            }
            else {
                sendAgent({
                    type: 'reward',
                    aiIdf: aiIdf,
                    reward: 1,  // Basic penalty
                });
            }
            bot.cmd({
                type: 'cp',
                cardIdx: cardIdx
            });
        }
    }
};

AIBot.prototype.proc_pcp = function(msg) {
    if(!this.training && this.shouldLog) console.log('pcp', msg.player, msg.card.shape, msg.card.num);
    this.playedCards.push(msg.card);
};

AIBot.prototype.proc_tend = function() {
    this.playedCards = [];
    if(!this.training && this.shouldLog) console.log('---------- trick end');
};

AIBot.prototype.proc_gend = function (msg) {
    if(!this.training && this.shouldLog) console.log(msg);
    if(this.training) {
        sendAgent({
            type: 'reward',
            aiIdf: this.userEntry.useridf,
            reward: msg.scores[this.selfIndex]
        });
        if(this.bidID !== null) {  // Run bid -> Later people can't bid anymore
            sendAgent({
                type: 'bidreward',
                aiIdf: this.userEntry.useridf,
                deck: this.deckEncoding,
                bid: this.bidID,
                reward:  msg.scores[this.selfIndex]
            });
        }
        sendAgent({
            type: 'endgame',
            aiIdf: this.userEntry.useridf,
        });
    }
    if(this.onEnd) this.onEnd(1);
};

AIBot.prototype.proc_gabort = function (msg) {
    if(!this.training && this.shouldLog) console.log(msg);
    if(this.onEnd) this.onEnd(-1);
};
