/**
 * Created by whyask37 on 2017. 1. 12..
 */

// @flow

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
    this.trustOpponentHavingJoker = 0;
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
        console.log(this.isFriend, this.deck.toString(), this.game.friendCard.toString());
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
 * 덱에서 특정 문양의 범위를 구한다
 * @param deck
 * @param shape
 */
function getShapeRange(deck, shape) {
    // 덱에서 해당 문양의 범위를 찾는다.
    let sStart = null, sEnd = null;
    for(let i = 0 ; i < deck.length ; i++) {
        if(deck[i].shape == shape) {
            if(sStart === null) sStart = i;
            sEnd = i;
        }
    }
    return [sStart, sEnd];
}


/**
 * 특정 숫자를 제외한 랜덤
 */
function randomExcluding(start, end, exclude) {
    let num = _.random(start, end);
    while(num == exclude) num = _.random(start, end);
    return num;
}

/**
 * 카드를 내는 알고리즘. 굉장히 복잡하지만 일단 이정도만 확인한다.
 * @param msg
 */
AISocket.prototype.proc_cprq = function(msg) {
    const deck = this.deck;
    const game = this.game;

    ///////////////////////////////////////////////////////////

    // 유틸리티 함수
    const playIndex = (index, shapeRequest, jcall) => {
        // TODO: 노기루다에서 애초에 기루다 조커콜을 부르지 않도록 하자.
        // 만일의 경우 노기루다에서 조커로 기루다 플레이를 시도할수도 있다.
        // 이 경우에는 그냥 조커콜을 무시.
        if(shapeRequest == 'none') shapeRequest = undefined;
        this.cmd({
            type: 'cp',
            cardIdx: index,
            srq: shapeRequest,
            jcall: jcall
        });
    };

    const canTakeLeadWith = (index) => {
        const cardStrength = game.calculateCardStrength(deck[index]);
        return (cardStrength > game.maxCardStrength);
    };

    const getCardRankInShape = (card) => {
        const cardNum = card.num;
        const higherCardCount = 14 - cardNum;
        if(higherCardCount) {
            // 현재까지 버려진 카드 + 내 덱에서 주공 현재 카드보다 쎈 카드를 구한다.
            const discardedPWC = game.discardedCards.filter(
                (c) => (c.shape == msg.shaperq && c.num > cardNum)
            ).length;
            return higherCardCount - discardedPWC;
        }
        else return 0;
    };

    ///////////////////////////////////////////////////////////


    // 프렌드는 일반적인 초보 수준을 목표로 짰다.

    // 1. 내가 시작 턴이라면
    if(this.selfIndex == game.startTurn) {
        if(this.isFriend) {
            // 2명 이상 기루다가 안뽑혔다면 기루다를 돌려야합니다.
            let girudaLackingOppCount = 0;
            for (let p = 0; p < 5; p++) {
                if (p == this.selfIndex) continue;
                else if (p == this.president) continue;
                if (this.noShapeInfo[p][game.bidShape]) girudaLackingOppCount++;
            }

            console.log('gloc', girudaLackingOppCount, deck.toString());

            // 기루다가 덜 뽑혔다면
            if (girudaLackingOppCount < 2 && deck.hasShape(game.bidShape)) {
                const [gStart, gEnd] = getShapeRange(deck, game.bidShape);
                if (gStart !== null) {
                    console.log('gl<2', deck.toString(), gStart, gEnd);
                    // 내가 짱카를 갖고 있다면 짱카 기루다를 돌린다.
                    if (getCardRankInShape(deck[gStart]) === 0) return playIndex(gStart);
                    else return playIndex(gEnd);  // 아니면 그냥 제일 낮은 기루다를 돌린다.
                }

                // 기루다도 못뽑는 무능한 프렌...
                // 주공에게 없는 문양을 돌린다.
                const pLackingShapes = _.shuffle(Object.keys(this.noShapeInfo[game.president]));
                for (let i = 0; i < pLackingShapes.length; i++) {
                    const shape = pLackingShapes[i];
                    const sEnd = getShapeRange(deck, shape)[1];
                    if (sEnd !== null) {
                        // 근데 얘가 미이티면 고려해보자.
                        if (deck[sEnd].equals(game.mighty)) continue;
                        return playIndex(sEnd);  // 주공이 간 칠 기회나 만들어주자
                    }
                }

                // 주공이 간칠 수 있는 문양도 없다. 너무 무능한 프렌이다.
                // 조커로라도 기루다를 뽑아보자.
                const jokerIndex = deck.indexOf(game.joker);
                if (jokerIndex != -1) {
                    return playIndex(jokerIndex, game.bidShape);
                }

                // 너무나도 무능한 프렌이다. 아무 문양이나 점수 없는 문양을 내보자.
                const nonScoreCards = [];
                deck.forEach((card, index) => {
                    if (!card.isScoreCard()) nonScoreCards.push(index);
                });
                if (nonScoreCards.length > 0) return playIndex(_.sample(nonScoreCards));

                // 남은것도 다 점카라고 한다. 마이티 빼고 암거나 내자
                // 마이티밖에 안남았을경우를 대비해 length==1은 특별처리
                if (deck.length == 1) return playIndex(0);
                else if (deck.hasCard(game.mighty)) {
                    let cardIdx = _.random(1, deck.length - 1);
                    while(deck[cardIdx].equals(game.mighty)) {
                        cardIdx = _.random(1, deck.length - 1);
                    }
                    return playIndex(cardIdx);
                }
                else return playIndex(_.random(0, deck.length - 1));
            }

            // 기루다도 꽤 뽑혔고, 뭘 내든 아마 주공이 알아서 할것같다.
            else {
                // 조커랑 마이티 빼고 암거나 내보자.
                const mightyIndex = deck.indexOf(game.mighty);
                const jokerIndex = deck.indexOf(game.joker);

                // 조커는 늘 마지막 카든데 그게 2번째 카드
                // 지금 조커가 효과가 있는 마지막 턴이다. 내고 죽자.
                if(jokerIndex == 1) {
                    return playIndex(1);
                }

                const dSelEnd = deck.length - 1 - (jokerIndex == -1 ? 0 : 1);  // 조커 제외한 카드들

                // randomExcluding은 mightyIndex가 유일한 남은 인덱스일 경우 무한루프에 걸린다.
                // 그래서 dSelEnd == mightyIndex == 0인 경우에 저 함수는 무한루프에 빠진다.
                // 이를 방지하기 위해 dSelIndex == 0인경우는 따로 미리 처리해야 한다.
                if(dSelEnd === 0) return playIndex(0);
                else return playIndex(randomExcluding(0, dSelEnd, mightyIndex));
            }
        }

        // 야당의 전략
        else {
            // ******* 마프가 아니고 조커콜이 가능하면 조콜을 한다.
            if(
                (game.friendType != 'card' || !game.friendCard.equals(game.mighty)) &&
                deck.hasCard(game.jokerCall) &&
                !game.discardedCards.hasShape('joker') &&
                !deck.hasCard(game.joker)  // 내가 조콜/조를 다 가진 야당일 경우엔 콜을 안한다.
            ) {
                return playIndex(deck.indexOf(game.jokerCall), undefined, true);
            }

            // 마이티가 안 뽑혔다면 마공
            const mightyShape = game.mighty.shape;
            if(deck.hasShape(mightyShape) && game.discardedCards.hasCard(game.mighty)) {
                const msEnd = getShapeRange(deck, mightyShape)[1];
                return playIndex(msEnd);  // 어차피 마공인데 제일 작은걸로 딜 넣는다.
            }

            // 아니라면 주공에게 있을만한 기루다가 아닌 문양을 돌린다
            // 그런 문양이 다 망하면 주공에게 없는 문양들도 돌린다.
            const pLackingShapes = _.shuffle(Object.keys(this.noShapeInfo[game.president]));
            const pHavingShapes = ['spade', 'heart', 'diamond', 'clover'].filter(
                s => (s != game.bidShape && pLackingShapes.indexOf(s) != -1));
            const pShapes = _.shuffle(pHavingShapes).concat(pLackingShapes);
            // 여기까지 하면 pShapes는 기루다/조커를를 제외한 모든 문양을 갖고 있고
            // 주공에게 있을 가능성이 있는 문양들이 pShapes 앞에 오게 된다.
            //   cf) 주공이 기루다가 없으면 pShapes에 기루다가 포함될 수 있다. 이러면 주공이 ㅂㅅ
            for (let i = 0; i < pShapes.length; i++) {
                const shape = pShapes[i];
                const [sStart, sEnd] = getShapeRange(deck, shape);
                if (sStart !== null) {
                    // 그 문양 짱카가 마이티면 고려해본다.
                    // 주공이 마이티도 없이 마프를 안부른게 이상하긴 하지만 그런 일도 있을 수 있으니 체크는 하자.
                    if (deck[sStart].equals(game.mighty)) {
                        if(sStart != sEnd) return playIndex(sStart + 1);  // 마이티 다음 짱카
                        else continue;
                    }
                    return playIndex(sStart);  // 그 문양 짱카
                }
            }

            // 놀랍게도 여기까지 왔다면 내가 야당 주제에 기루다/마이티/조커만 있다는 뜻이다.
            // 이상황에서는 백런을 노리는게 맞다.

            // 조커가 있다면 기루다 플레이를 해서 주공을 괴롭힌다.
            if(deck[deck.length - 1].shape == 'joker') {
                return playIndex(deck.length - 1, game.bidShape);
            }
            // 아니면 낮은 기루다/마이티를 계속 돌려준다.
            return playIndex(deck.length - 1);
        }
    }

    // 2. 조커 콜 처리 - 더 고려할게 없다.
    if(msg.jcall) {
        const jokerIndex = deck.indexOf(game.joker);
        if (jokerIndex != -1) {
            // 조커랑 마이티가 둘 다 있으면 조콜에서도 마이티를 낸다.
            // 조커는 언젠가는 써야하잖아.
            const mightyIndex = deck.indexOf(game.mighty);
            if(mightyIndex != -1) return playIndex(mightyIndex);
            else return playIndex(jokerIndex);
        }
    }

    // 3. 문양 요청시 - 그 문양이 있으면 내야합니다.
    if(msg.shaperq) {
        // cf) (currentTurn - startTurn + 5) % 5 : currentTurn이 startTurn 기준 몇번째 턴인가
        let hasPresidentPlayed = (
            (game.currentTurn - game.startTurn + 5) % 5 >
            (game.president - game.startTurn + 5) % 5
        );  // 주공이 카드를 이미 냈는가?

        const jokerIndex = deck.indexOf(game.joker);
        const [sStart, sEnd] = getShapeRange(deck, msg.shaperq);

        // 문양이 존재 -> 내야한다.
        if(sStart !== null) {
            // 여당이라면
            if(this.isFriend) {
                // 주공이 해당 문양에서 선을 잡을 수 있다면 주공에게 선을 넘겨준다.
                let canPresidentWin = false;

                // 현재 주공이 잠재적인 선이다.
                if(game.trickWinner === game.president) {
                    const presidentCard = game.playedCards[
                    (game.trickWinner - game.startTurn + 5) % 5
                        ];  // 주공이 낸 카드!

                    // 주공이 선플레이어가 아니고 간을 쳤다면 주공이 이기겠지 뭐
                    if(
                        game.president != game.startTurn &&
                        msg.shaperq !== game.bidShape &&
                        presidentCard.shape == game.bidShape
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
                            const myDeckPWC = deck.filter(
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
                    if(deck.hasCard(game.mighty)) {
                        return playIndex(deck.indexOf(game.mighty));
                    }
                    // 조커가 있어도 밟아준다.
                    else if(
                        game.currentTurn != 1 && game.currentTurn != 10 &&
                        deck.hasCard(game.joker)
                    ) {
                        return playIndex(deck.indexOf(game.joker));
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
                const remainingTurns = (this.startTurn - this.currentTurn + 5) % 5 - 1;

                // 내가 주공/프렌드를 밟을 수 있으면 밟는다.
                if(
                    game.trickWinner === game.president ||
                    game.trickWinner === game.friend
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
                else if(hasPresidentPlayed) {  // 주공이 이미 냄 : 주공이 무섭지 않다.
                    let minimumScoreCard = sStart;
                    while(minimumScoreCard < sEnd) {
                        if(!deck[minimumScoreCard + 1].isScoreCard()) break;
                        minimumScoreCard++;
                    }
                    return playIndex(minimumScoreCard);  // 야당/안밝혀진 프렌에겐 점수를 싣는다.
                }

                // 조커가 있는데 점수가 2개 이상 쌓이면 조커를 낸다.
                if(this.currentTurn != 1 && this.currentTurn != 10 && jokerIndex != -1) {
                    /*
                        1 0 * ? ? -> 1 2 -> no
                        1 * ? ? ? -> 1 3 -> yes
                        1 1 * ? ? -> 2 2 -> yes
                        1 0 1 * ? -> 2 1 -> yes
                     */
                    const expectedScoreCount = (
                        game.playedCards.filter(c => c.isScoreCard()).length + // 이미 나온 점카들
                        0.4 * Math.max(remainingTurns, 0) // 앞으로 나올 점카 갯수 예상치
                    );
                    if(expectedScoreCount >= 2) {
                        // 마이티가 나왔으면
                        if(!game.playedCards.hasCard(game.mighty)) {
                            return playIndex(jokerIndex);
                        }
                    }
                }

                // 마프고 조커가 안 빠졌고 (조커가 야당에게 있겠지? 란 기대로)
                // 내가 2번째 턴이고 첫턴이 점카고 조커가 안 빠졌으면 이 턴에 실어주는걸 고려해봐야한다.
                // 이 짓은 최대 2번만 한다. 그 안에 조커가 안나오면 조커가 주공에 있다 가정한다.
                if(
                    this.trustOpponentHavingJoker < 2 &&
                    remainingTurns == 3 &&
                    game.mighty.equals(game.friendCard) &&
                    game.playedCards[0].isScoreCard() &&
                    Math.random() < 0.7 &&  // 70% 확률로 싣는다.
                    !game.discardedCards.hasShape('joker')
                ) {
                    let minimumScoreCard = sStart;
                    while(minimumScoreCard < sEnd) {
                        if(!deck[minimumScoreCard + 1].isScoreCard()) break;
                        minimumScoreCard++;
                    }

                    // 지금 돌고있는게 기루다면 J/10만 싣는다.
                    if(msg.shaperq == game.bidShape) {
                        const cardNum = deck[minimumScoreCard].num;
                        if(cardNum == 10 || cardNum == 11) {
                            this.trustOpponentHavingJoker++;
                            return playIndex(minimumScoreCard);
                        }
                    }

                    // 아니면 그냥 제일 낮은 점카를 싣는다.
                    else {
                        this.trustOpponentHavingJoker++;
                        return playIndex(minimumScoreCard);
                    }
                }

                // 그냥 제일 낮은 카드를 싣는다.
                return playIndex(sEnd);
            }
        }
    }

    // 그 외 -> 나도 모르겠다. 아무거나 낸다.
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
