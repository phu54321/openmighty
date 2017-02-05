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

    setTimeout(() => {
        const cmdProcessor = cmdproc[msg.type];
        if (!cmdProcessor) {
            // console.log('[' + this.userEntry.useridf + '] Unknown command : ' + msg.type);
            return false;
        }
        // console.log('[' + this.userEntry.useridf + ' Out]', msg);
        return cmdProcessor(this, this.game, this.userEntry, msg);
    }, 400);
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
    const badCommand = ['d3rq', 'bc1rq', 'fsrq'];
    const mthName = 'proc_' + msg.type;
    if (this[mthName]) return this[mthName](msg);
    else if(badCommand.indexOf(msg.type) != -1) {
        // 바로 게임을 멈춥니다.
        process.nextTick(() => this.cmd({ type: 'abort' }));
    }
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
            this.selfIndex = i;
            break;
        }
    }

    // 각 플레이어가 어떤 문양이 없는지를 본다.
    this.noShapeInfo = [{}, {}, {}, {}, {}];
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
            global.logger.debug(`AI ${this.userEntry.useridf} is friend`);
        }
    }
    else if(msg.ftype == 'player') {
        this.isFriend = (this.game.friend == this.selfIndex);
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

    const canTakeLeadWith = (index) => {
        const cardStrength = this.game.calculateCardStrength(this.deck[index]);
        return (cardStrength > this.game.maxCardStrength);
    };

    const getCardRankInShape = (card) => {
        const cardNum = card.num;
        const higherCardCount = 14 - cardNum;
        if(higherCardCount) {
            // 현재까지 버려진 카드 + 내 덱에서 주공 현재 카드보다 쎈 카드를 구한다.
            const discardedPWC = this.game.discardedCards.filter(
                (c) => (c.shape == msg.shaperq && c.num > cardNum)
            ).length;
            return higherCardCount - discardedPWC;
        }
        else return 0;
    };

    ///////////////////////////////////////////////////////////


    // 프렌드는 일반적인 초보 수준을 목표로 짰다.
    const deck = this.deck;


    // TODO: 내가 시작 턴이라면

    // 2. 문양 요청시 - 그 문양이 있으면 내야합니다.
    if(msg.shaperq) {
        // 조커 콜 처리 - 더 고려할게 없다.
        if(msg.jcall) {
            const jokerIndex = deck.indexOf(this.game.joker);
            if (jokerIndex != -1) {
                return playIndex(deck.indexOf(this.game.joker));
            }
        }

        // 덱에서 해당 문양의 범위를 찾는다.
        let sStart = null, sEnd = null;
        for(let i = 0 ; i < deck.length ; i++) {
            if(deck[i].shape == msg.shaperq) {
                if(sStart === null) sStart = i;
                sEnd = i;
            }
        }

        // 문양이 존재 -> 내야한다.
        if(sStart !== null) {
            // 여당이라면
            if(this.isFriend) {
                // 주공이 해당 문양에서 선을 잡을 수 있다면 주공에게 선을 넘겨준다.
                let canPresidentWin = false;

                // cf) (currentTurn - startTurn + 5) % 5 : currentTurn이 startTurn 기준 몇번째 턴인가
                let hasPresidentPlayed = (
                    (this.game.currentTurn - this.game.startTurn + 5) % 5 >
                    (this.game.president - this.game.startTurn + 5) % 5
                );  // 주공이 카드를 이미 냈는가?

                // 현재 주공이 잠재적인 선이다.
                if(this.game.trickWinner === this.game.president) {
                    const presidentCard = this.game.playedCards[
                        (this.game.trickWinner - this.game.startTurn + 5) % 5
                    ];  // 주공이 낸 카드!

                    // 주공이 선플레이어가 아니고 간을 쳤다면 주공이 이기겠지 뭐
                    if(
                        this.game.president != this.game.startTurn &&
                        msg.shaperq !== this.game.bidShape &&
                        presidentCard.shape == this.game.bidShape
                    ) {
                        canPresidentWin = true;
                    }

                    // 그 외 : 주공이 낸게 주공 카드 문양중에 짱칸지를 봐야한다.
                    else {
                        // 조커는 짱카 가정
                        if (presidentCard.shape == 'joker') canPresidentWin = true;

                        // 주공이 해당 문양에서 짱카를 냈는가? (내 덱 제외)
                        else {
                            const presidentCardRank = getCardRankInShape(presidentCard);
                            const myDeckPWC = this.deck.filter(
                                (c) => (c.shape == msg.shaperq && c.num > presidentCard.num)
                            ).length;  // 내 덱 카드중 주공 카드를 밟는 갯수

                            if (presidentCardRank == myDeckPWC) {
                                // 주공이 내 덱 제외 짱카다.
                                canPresidentWin = true;
                            }
                        }
                    }
                }

                // 주공이 플레이하기 전이면
                else if(!hasPresidentPlayed) {
                    canPresidentWin = true;  // 주공을 일단 믿자.
                }

                // 주공이 이길것같으면 제일 낮은 카드를 낸다.
                if(canPresidentWin) {
                    return playIndex(sEnd);
                }
                else {
                    // 마이티가 있으면 밟아준다.
                    if(this.deck.hasCard(this.game.mighty)) {
                        return playIndex(this.deck.indexOf(this.game.mighty));
                    }
                    // 조커가 있어도 밟아준다.
                    else if(
                        this.currentTurn != 1 && this.currentTurn != 10 &&
                        this.deck.hasCard(this.game.joker)
                    ) {
                        return playIndex(this.deck.indexOf(this.game.joker));
                    }

                    // 내가 선을 먹을 수 있다면 제일 쎈걸로
                    // (더 쎈걸로 밟힐수도 있으니까 어중간한게 쎈거 말고 그냥 제일 쎈걸로 낸다)
                    if(canTakeLeadWith(sStart)) return playIndex(sStart);
                    // 아님 야당에게 힘 실어주지 말고 제일 낮은거 내자.
                    else return playIndex(sEnd);
                }
            }

            // 야당이라면 전략이 달라진다.
            else {
                // 내가 주공/프렌드를 밟을 수 있으면 밟는다.
                if(
                    this.game.trickWinner === this.game.president ||
                    this.game.trickWinner === this.game.friend
                ) {
                    // 여당을 간신히 이길정도의 카드를 낸다.
                    if(canTakeLeadWith(sStart)) {
                        let minimumWinnerIndex = sStart;
                        while(minimumWinnerIndex < sEnd) {
                            if(!canTakeLeadWith(minimumWinnerIndex + 1)) break;
                            minimumWinnerIndex++;
                        }
                        return playIndex(minimumWinnerIndex);
                    }
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
 * 그동안 플레이어가 낸 카드를 바탕으로, 사람들에게 없는 카드를 알아본다.
 * @param msg
 */
AISocket.prototype.proc_pcp = function (msg) {
    const currentShapeRequest = this.game.shapeRequest;
    if(msg.card.shape == 'joker') return;  // 조커는 처리하지 않습니다.
    if(msg.card.shape != currentShapeRequest) {
        this.noShapeInfo[msg.player][currentShapeRequest] = true;
        if(this.isFriend) {
            global.logger.debug(`player #${msg.player} don't have ${currentShapeRequest}`);
        }
    }
};


/**
 * 한번의 트릭이 마쳤을 때 처리. 초구 프렌드 처리를 한다.
 */
AISocket.prototype.proc_tend = function (msg) {
    if(this.game.currentTrick == 1 && this.game.friendType == 'first') {
        this.isFriend = (msg.winner == this.selfIndex);
    }
};
