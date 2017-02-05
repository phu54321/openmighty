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

    this.game = room;
    this.userEntry = userEntry;
    this.gameUsers = [];
    this.deck = null;
    this.isFriend = null;
    this.noShapeInfo = [];
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
    return cmdProcessor(this, this.game, this.userEntry, msg);
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
 * gusers(게임 유저) 메세지를 처리. 내가 몇번째인지 보고 기타 게임 처리
 * @param msg
 */
AISocket.prototype.proc_gusers = function (msg) {
    // 내가 몇번째 플레이어인지 본다.
    const users = msg.users;
    for(let i = 0 ; i < users.length ; i++) {
        if(users[i].useridf == this.userEntry.useridf) {
            this.selfID = i;
            break;
        }
    }

    // 각 플레이어가 어떤 문양이 없는지를 본다.
    this.noShapeInfo = [];
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
        this.isFriend = this.deck.hasCard(this.game.friendCard);
        if(this.isFriend) {
            global.logger.info(`AI ${this.userEntry.useridf} is friend`);
        }
    }
    else if(msg.ftype == 'player') {
        this.isFriend = (this.game.friend == this.selfID);
    }
    else this.isFriend = false;
};


/**
 * 카드를 내는 알고리즘. 굉장히 복잡하지만 일단 이정도만 확인한다.
 * @param msg
 */
AISocket.prototype.proc_cprq = function(msg) {
    // 유틸리티 함수
    const playIndex = (index) => {
        this.cmd({
            type: 'cp',
            cardIdx: index
        });
    };

    ///////////////////////////////////////////////////////////


    // 프렌드는 일반적인 초보 수준을 목표로 짰다.
    const deck = this.deck;

    // 조커 콜 처리 - 더 고려할게 없다.
    if(msg.jcall) {
        const jokerIndex = deck.getCardIndex(this.game.joker);
        if (jokerIndex != -1) {
            return playIndex(deck.getCardIndex(this.game.joker));
        }
    }

    // 1. 문양 요청시 - 그 문양을 내야한다.
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
            const firstCard = this.game.playedCards[0];
            if(this.isFriend) {
                // 주공이 해당 문양에서 선을 잡을 수 있다면 주공이 선을 잡을 수 있도록 해준다.
                let canPresidentWin = false;
                if(this.game.trickWinner === this.game.president) {  // 현재 주공이 선이다
                    // 주공이 앞으로도 선인가? 잘 따져보자.

                    // 1. 주공이 간을 쳤다 -> 아마 주공이 선 먹겠지
                    if(this.game.president != this.game.startTurn) canPresidentWin = true;
                    // 2. 조커는 짱카 가정
                    else if(firstCard.shape == 'joker') canPresidentWin = true;
                    // 3. 주공이 해당 문양에서 짱카를 냈는가?
                    else {
                        const firstCardNum = firstCard.num;
                        const potentialWinnerCount = 14 - firstCardNum;
                        if(potentialWinnerCount) {
                            // 현재까지 버려진 카드 + 내 덱에서 주공 현재 카드보다 쎈 카드를 구한다.
                            const discardedPWC = this.game.discardedCards.filter(
                                (c) => (c.shape == msg.shaperq && c.num > firstCardNum)
                            ).length;
                            const myDeckPWC = this.deck.filter(
                                (c) => (c.shape == msg.shaperq && c.num > firstCardNum)
                            ).length;

                            // 주공이 짱카같으면 true
                            if(potentialWinnerCount == discardedPWC + myDeckPWC) {
                                canPresidentWin = true;
                            }
                        }
                    }
                }

                // 주공이 플레이하기 전
                // cf) (currentTurn - startTurn + 5) % 5 : currentTurn이 startTurn 기준 몇번째 턴인가
                else if(
                    (this.game.currentTurn - this.game.startTurn + 5) % 5 <
                    (this.game.president - this.game.startTurn + 5) % 5
                ) {
                    // TODO : 주공이 간을 칠 수 있는지를 봅니다.
                    canPresidentWin = true;  // 주공을 일단 믿는다.
                }

                if(canPresidentWin) return playIndex(sEnd);
                else {
                    // 내가 제일 높은걸 내서 야당에게 힘을 실어주는가?
                    const bestCardStrength = this.game.calculateCardStrength(this.deck[sStart]);
                    if(bestCardStrength > this.game.maxCardStrength) return playIndex(sStart);
                    else return playIndex(sEnd);
                }
            }
            else {  // 야당이면 닥치고 낮은 문양부터
                // 내가 주공/프렌드를 밟을 수 있으면 밟는다.
                if(
                    this.game.trickWinner === this.game.president ||
                    this.game.trickWinner === this.game.friend
                ) {
                    const bestCardStrength = this.game.calculateCardStrength(this.deck[sStart]);
                    if(bestCardStrength > this.game.maxCardStrength) return playIndex(sStart);
                }
                // 아니면 제일 낮은거.
                return playIndex(sEnd);
            }
        }
    }

    // 그 외 -> 아무거나 낸다.
    this.cmd({
        type: 'cp',
        cardIdx: _.random(0, deck.length - 1)
    });
};


/**
 * 한번의 트릭이 마쳤을 때 처리. 초구 프렌드 처리를 한다.
 */
AISocket.prototype.proc_tend = function (msg) {
    if(this.game.currentTrick == 1 && this.game.friendType == 'first') {
        this.isFriend = (msg.winner == this.selfID);
    }
};
