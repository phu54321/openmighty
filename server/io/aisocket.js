/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";


const cmdproc = require("./cmdproc");
const mutils = require('../logic/mutils');
const _ = require('underscore');


function AISocket(room, userEntry) {
    "use strict";

    this.room = room;
    this.userEntry = userEntry;
    this.gameUsers = [];
    this.deck = null;
    this.playedCards = [];
}

AISocket.prototype.cmd = function (msg) {
    "use strict";

    const cmdProcessor = cmdproc[msg.type];
    if(!cmdProcessor) {
        console.log('[' + this.userEntry.useridf + '] 알 수 없는 명령입니다 : ' + msg.type);
        return false;
    }
    console.log('[' + this.userEntry.useridf + ' Out]', msg);
    return cmdProcessor(this, this.room, this.userEntry, msg);
};

AISocket.prototype.emit = function (type, msg) {
    "use strict";

    console.log('[' + this.userEntry.useridf + ' In]', msg);
    if(type == 'cmd') {
        this.onCommand(msg);
    }
};

AISocket.prototype.onCommand = function (msg) {
    process.nextTick(() => {
        "use strict";
        const deck = this.deck;

        if(msg.type == 'bidrq') {
            // Always pass
            this.cmd({
                type: 'bid',
                shape: 'pass'
            });
        }
        else if(msg.type == 'bidinfo') {
            this.playedCards = [];
        }
        else if(msg.type == 'deck') {
            this.deck = msg.deck;
        }
        else if(msg.type == 'pcplay') {
            this.playedCards.push(msg.card);
        }
        else if(msg.type == 'playrq') {
            // 조커 콜 처리
            if(msg.jcall && mutils.hasShapeOnDeck('joker', deck)) msg.shaperq = 'joker';

            // 문양 요청시
            if(msg.shaperq) {
                for(let i = 0 ; i < deck.length ; i++) {
                    if(deck[i].shape == msg.shaperq) {
                        this.cmd({
                            type: 'cplay',
                            cardIdx: i
                        });
                        return;
                    }
                }
            }

            // 그 외 -> 아무거나 낸다
            this.cmd({
                type: 'cplay',
                cardIdx: _.random(0, deck.length - 1)
            });
        }
        else if(msg.type == 'tend') {
            this.playedCards = [];
        }
    });
};

module.exports = AISocket;
