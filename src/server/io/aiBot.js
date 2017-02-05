/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";


const cmdproc = require("./cmdproc");
const _ = require('underscore');
const Deck = require('../logic/deck');
const card = require('../logic/card');
const cmdcmp = require('../cmdcmp/cmdcmp');


function AISocket(room, userEntry) {
    "use strict";

    this.room = room;
    this.userEntry = userEntry;
    this.gameUsers = [];
    this.deck = null;
    this.isFriend = null;
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
        // console.log('[' + this.userEntry.useridf + '] Unknown command : ' + msg.type);
        return false;
    }
    // console.log('[' + this.userEntry.useridf + ' Out]', msg);
    return cmdProcessor(this, this.room, this.userEntry, msg);
};



/**
 * socket.emit랑 비슷한 역할을 합니다 메세지를 전달받습니다.
 */
AISocket.prototype.emit = function (type, msg) {
    "use strict";

    if(type == 'cmd') {
        msg = cmdcmp.decompressCommand(msg);
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
    }, 800);
};

module.exports = AISocket;


///////////////////////////////////////////////
//// AI Handler


/**
 * gusers(게임 유저) 메세지를 처리. 내가 몇번째인지 본다.
 * @param msg
 */
AISocket.prototype.proc_gusers = function (msg) {
    const users = msg.users;
    for(let i = 0 ; i < users.length ; i++) {
        if(users[i].useridf == this.userEntry.useridf) {
            this.selfID = i;
            break;
        }
    }
};


/**
 * deck(덱) 메세지를 처리.
 * @param msg
 */
AISocket.prototype.proc_deck = function (msg) {
    this.deck = new Deck(msg.deck.map((c) => card.createCard(c.shape, c.num)));
};


/**
 * bidrq(공약 요청) 메세지를 처리. 일단은 무조건 패스하도록 했다.
 */
AISocket.prototype.proc_bidrq = function () {
    this.cmd({
        type: 'bid',
        shape: 'pass'
    });
};

/**
 * 프렌드 선택. 내가 프렌드인지 아닌지를 확인한다.
 */
AISocket.prototype.proc_fs = function (msg) {
    if(msg.ftype == 'card') {
        this.isFriend = this.deck.hasCard(this.room.friendCard);
        if(this.isFriend) {
            global.logger.info(`AI ${this.userEntry.useridf} is friend`);
        }
    }
    else if(msg.ftype == 'player') {
        this.isFriend = (this.room.friend == this.selfID);
    }
    else this.isFriend = false;
};


/**
 * 카드를 내는 알고리즘. 굉장히 복잡하지만 일단 이정도만 확인한다.
 * @param msg
 */
AISocket.prototype.proc_cprq = function(msg) {
    // 프렌드는 일반적인 초~중수 수준을 목표로 짰다.
    const deck = this.deck;

    // 조커 콜 처리
    if(msg.jcall && deck.hasShape('joker')) msg.shaperq = 'joker';

    // 문양 요청시 - 그 문양을 내야한다.
    if(msg.shaperq) {
        let sStart = null, sEnd = null;
        for(let i = 0 ; i < deck.length ; i++) {
            if(deck[i].shape == msg.shaperq) {
                if(sStart === null) sStart = i;
                sEnd = i;
            }
        }

        // 문양이 존재 -> 내야한다.
        if(sStart !== null) {
            this.cmd({
                type: 'cp',
                cardIdx: _.random(sStart, sEnd)
            });
            return;
        }
    }

    // 그 외 -> 아무거나 낸다
    this.cmd({
        type: 'cp',
        cardIdx: _.random(0, deck.length - 1)
    });
};


/**
 * 한번의 트릭이 마쳤을 때 처리. 초구 프렌드 처리를 한다.
 */
AISocket.prototype.proc_tend = function (msg) {
    if(this.room.currentTrick == 1 && this.room.friendType == 'first') {
        this.isFriend = (msg.winner == this.selfID);
    }
};
