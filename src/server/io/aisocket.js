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

/**
 * cmd 액션을 게임에 전달합니다.
 * @param msg
 * @returns {boolean}
 */
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


/**
 * socket.emit랑 비슷한 역할을 합니다 메세지를 전달받습니다.
 */
AISocket.prototype.emit = function (type, msg) {
    "use strict";

    console.log('[' + this.userEntry.useridf + ' In]', msg);
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
AISocket.prototype.onCommand = function (msg) {
    setTimeout(() => {
        const badCommand = ['d3rq', 'bc1rq', 'fsrq'];
        const mthName = 'proc_' + msg.type;
        if (this[mthName]) return this[mthName](msg);
        else if(badCommand.indexOf(msg.type) != -1) {
            this.cmd({ type: 'abort' });
        }
    }, 400);
};

module.exports = AISocket;


///////////////////////////////////////////////
//// AI Handler


// Ignored actions

AISocket.prototype.proc_deck = function (msg) {
    this.deck = msg.deck;
};



AISocket.prototype.proc_bidrq = function () {
    this.cmd({
        type: 'bid',
        shape: 'pass'
    });
};


AISocket.prototype.proc_binfo = function () {
    this.playedCards = [];
};

AISocket.prototype.proc_cprq = function(msg) {
    const deck = this.deck;

    // 조커 콜 처리
    if(msg.jcall && mutils.hasShapeOnDeck('joker', deck)) msg.shaperq = 'joker';

    // 문양 요청시
    if(msg.shaperq) {
        for(let i = 0 ; i < deck.length ; i++) {
            if(deck[i].shape == msg.shaperq) {
                this.cmd({
                    type: 'cp',
                    cardIdx: i
                });
                return;
            }
        }
    }

    // 그 외 -> 아무거나 낸다
    this.cmd({
        type: 'cp',
        cardIdx: _.random(0, deck.length - 1)
    });
};

AISocket.prototype.proc_pcp = function(msg) {
    this.playedCards.push(msg.card);
};

AISocket.prototype.proc_tend = function() {
    this.playedCards = [];
};
