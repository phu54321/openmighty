/**
 * Created by whyask37 on 2017. 1. 12..
 */

// @flow

"use strict";


const cmdproc = require("./cmdproc");
const _ = require('lodash');
const Deck = require('../logic/deck');
const card = require('../logic/card');
const sendCmd = require('../../clientjs/game/sendCmd');
const cmdcmp = require('../cmdcmp/cmdcmp');
const bidding = require('../logic/bidding');


function AISocket(room, userEntry, playSpeed) {
    "use strict";

    this.game = room;
    this.userEntry = userEntry;
    this.gameUsers = [];
    this.deck = null;
    this.isFriend = null;

    this.noShapeInfo = [{}, {}, {}, {}, {}];
    this.trustOpponentHavingJoker = 0;

    this.playSpeed = playSpeed || 800;
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
    }, this.playSpeed);
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
        console.log(this.userEntry.useridf, 'err', msg);
        this.cmd({ type: 'stop' });
    }
};



/**
 * 게임에서 받은 cmd를 처리합니다.
 * @param msg
 */
AISocket.prototype.onCommand = function (msg) {
    const badCommand = [];
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
};


/**
 * deck(덱) 메세지를 처리.
 * @param msg
 */
AISocket.prototype.proc_deck = function (msg) {
    this.deck = new Deck(msg.deck.map((c) => card.createCard(c.shape, c.num)));
};


AISocket.prototype.getExpectedWinningTurns = function () {
    if(this.biddingCache !== undefined) return this.biddingCache;

    // 공약을 테스트해본다.
    const deckByShapes = this.deck.splitShapes();
    const hasJoker = (deckByShapes.joker.length > 0);

    // 예상 기루다.
    let maxWinExpect = 0;
    let maxWinExpectShape = null;

    card.cardShapes.forEach(bidShape => {
        if(bidShape == 'joker') return;

        const mightyShape = (bidShape == 'spade' ? 'diamond' : 'spade');
        const hasMighty = this.deck.hasCard(card.createCard(mightyShape, 14));

        // 기루다는 조커 포함 최소 4장 이상 있어야 한다.
        const girudaCount = (hasJoker ? 1 : 0) + deckByShapes[bidShape].length;
        if (girudaCount < 4) return;

        // A가 없을 때 : 물카(마프) -> 1턴을 돌릴 수 있다. A나 K는
        let winExpect = girudaCount;
        if(!hasJoker && deckByShapes[bidShape][0].num != 14) {
            winExpect--;  // 에이스가 없으면 한 턴은 뺏김
        }

        // 마이티는 여당에 있으니까 한턴은 먹고 들어간다.
        winExpect++;

        // 초구가 있는가?
        const initialCardCount = card.cardShapes
            .map((shape, index) => {
                if(shape == 'joker' || shape == bidShape) return -1;

                const topCard = (shape == mightyShape ? 13 : 14);
                if(deckByShapes[shape].length > 0 && deckByShapes[shape][0].num == topCard) return index;
                return -1;
            })
            .filter(index => (index != -1)).length;
        winExpect += initialCardCount;

        // 마이티가 나한테 있고 조커가 프렌에게 있으면 프렌도 +1일거다.
        if(hasMighty && !hasJoker) winExpect += 1;

        // 약간 optimistic하게, 프렌이 한턴정도 더 도와준다 생각한다.
        winExpect++;

        if(maxWinExpect < winExpect) {
            maxWinExpect = winExpect;
            maxWinExpectShape = bidShape;
        }

        console.log(bidShape, winExpect, this.deck.toString());
    });

    if(maxWinExpect === 0) this.biddingCache = null;
    else {
        this.biddingCache = {
            bidCount: Math.min(20 - (10 - maxWinExpect) * 2.5, 20) | 0,
            bidShape: maxWinExpectShape
        };
    }
    return this.biddingCache;
};



/**
 * bidrq(공약 요청) 메세지를 처리. 일단은 무조건 패스하도록 했다.
 */
AISocket.prototype.proc_bidrq = function () {
    const bidCandidate = this.getExpectedWinningTurns();
    if(bidCandidate) {
        // 다른 사람이 공약해서 질 경우 : bidCount -> 50%정도 성공한다 본다.
        //   이길 경우 : +1
        //   질 경우 : -2 * (bidCount - 13)
        // 내가 공약할 경우
        //   이길 경우 : 4 * (bidCount - 13)
        //   질 경우 : -3
        const bidShape = bidCandidate.bidShape;
        let bidCount = Math.min(20, bidCandidate.bidCount + 1);  // 주어오는거에서 1개 더 나오리라 믿는다.
        if(bidCount >= 18) bidCount = 20;  // 18개면 그냥 20개를 달리자;

        const myBidStrength = bidding.getBidStrength(bidShape, bidCount);
        console.log(bidShape, bidCount, myBidStrength, this.game.bidding.bidStrength);
        if(myBidStrength > this.game.bidding.bidStrength) {
            return this.cmd({
                type: 'bid',
                shape: bidShape,
                num: bidCount
            });
        }
    }

    if(this.deck.getDealMissScore() <= 1) {
        this.cmd({
            type: 'bid',
            shape: 'dealmiss'
        });
    }
    else {
        this.cmd({
            type: 'bid',
            shape: 'pass'
        });
    }
};


/**
 * 1차 공약 변경
 * @param msg
 */
AISocket.prototype.proc_bc1rq = function (msg) {
    this.isPresident = true;

    this.cmd({
        type: 'bc1',
        shape: 'pass'
    });
};


AISocket.prototype.proc_fsrq = function () {
    const msg = {type: 'fs'};

    // 추가공약 처리
    delete this.biddingCache;

    const bidCandidate = this.getExpectedWinningTurns();
    let bidShape = bidCandidate.bidShape;
    let bidCount = bidCandidate.bidCount;
    const newBidStrength = bidding.getBidStrength(bidShape, bidCount);

    if (!(
            (this.game.bidShape != bidShape && newBidStrength <= this.bidStrength + 1) ||
            (this.game.bidShape == bidShape && this.game.bidCount > bidCount)
        )) {
        msg.bidch2 = {
            shape: bidShape,
            num: bidCount
        };
    }
    else {
        bidShape = this.game.bidShape;
        bidCount = this.game.bidCount;
    }

    // 잡다한 상수
    const mightyShape = (bidShape == 'spade') ? 'diamond' : 'spade';

    // 원래 카드 말고 가장 많은 카드 문양을 부기루다로 지정
    const deckByShape = this.deck.splitShapes();
    const nonGirudaShapes = card.cardShapes
        .filter(shape => (shape != bidShape && shape != 'joker'));
    const nonGirudaShapeCounts = nonGirudaShapes.map(shape => deckByShape[shape].length);
    const ngsOrder = [0, 1, 2, 3]
        .slice(0, nonGirudaShapeCounts.length)
        .sort((a, b) => nonGirudaShapeCounts[b] - nonGirudaShapeCounts[a]);
    const subGiruda = nonGirudaShapes[ngsOrder[0]];
    this.subGiruda = subGiruda;

    // 버릴 카드 선정
    const cardScoreMap = this.deck.map(card => {
        let cardScore = 0;
        if (card.shape == bidShape) cardScore += 200;
        if (card.shape == subGiruda) cardScore += 100;
        if (card.shape == 'joker') cardScore += 500;
        if (card.shape == mightyShape && card.num == 14) cardScore += 500;
        if (card.num == 14) cardScore += 100;
        cardScore += card.num;
        return cardScore;
    });
    const cardPriority = _.shuffle(_.range(this.deck.length));
    cardPriority.sort((a, b) => cardScoreMap[a] - cardScoreMap[b]);
    msg.discards = [cardPriority[0], cardPriority[1], cardPriority[2]];

    // 프렌드 선정
    msg.ftype = 'card';

    // 마이티가 없음 마프
    if (!this.deck.hasCard(card.createCard(mightyShape, 14))) {
        msg.shape = mightyShape;
        msg.num = 14;
    }

    // 조커가 없음 조프
    else if (!this.deck.hasShape('joker')) {
        msg.shape = 'joker';
        msg.num = 0;
    }

    // 기루다 A
    else if (!this.deck.hasCard(card.createCard(bidShape, 14))) {
        msg.shape = mightyShape;
        msg.num = 14;
    }

    // 기루다 K
    else if (!this.deck.hasCard(card.createCard(bidShape, 13))) {
        msg.shape = mightyShape;
        msg.num = 14;
    }

    // 부기루다 A
    else if (!this.deck.hasCard(card.createCard(subGiruda, 14))) {
        msg.shape = mightyShape;
        msg.num = 14;
    }

    // 부기루다 K
    else if (!this.deck.hasCard(card.createCard(subGiruda, 13))) {
        msg.shape = mightyShape;
        msg.num = 14;
    }

    // 초구
    else {
        msg.ftype = 'first';
    }

    this.cmd(msg);
};

/**
 * 프렌드 선택. 내가 프렌드인지 아닌지를 확인한다.
 */
AISocket.prototype.proc_fs = function (msg) {
    if(msg.ftype == 'card') {
        this.isFriend = this.deck.hasCard(this.game.friendCard);
        if(this.isFriend) {
            // global.logger.debug(`AI ${this.userEntry.useridf} is friend`);
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
    // console.log(this.userEntry.useridf, deck.toString());

    ///////////////////////////////////////////////////////////

    // 유틸리티 함수
    const playIndex = (index, shapeRequest, jcall) => {
        // TODO: 노기루다에서 애초에 기루다 조커콜을 부르지 않도록 하자.
        // 만일의 경우 노기루다에서 조커로 기루다 플레이를 시도할수도 있다.
        // 이 경우에는 그냥 조커콜을 무시.
        if(shapeRequest == 'none') shapeRequest = undefined;
        // console.log('pi', index, shapeRequest, jcall);
        this.cmd({
            type: 'cp',
            cardIdx: index,
            srq: shapeRequest,
            jcall: jcall
        });
    };


    /**
     * 마이티/조커/기루다를 제외하고 아무거나 낸다.
     */
    const playNonMJG = () => {
        const playable = [];
        this.deck.forEach((card, index) => {
            if(card.equals(game.mighty)) return;
            else if(card.shape == 'joker') return;
            else if(card.shape == game.bidShape) return;
            playable.push(index);
        });
        if(playable.length > 0) return playIndex(_.sample(playable));

        // 전부 마이티/조커/기루다 - 기루다를 아무거나.
        this.deck.forEach((card, index) => {
            if(card.shape == game.bidShape) playable.push(index);
        });
        if(playable.length > 0) return playIndex(_.sample(playable));

        // 모르겠다 그냥 조커/마이티 순으로 내자.
        return playIndex(deck.length - 1);
    };


    /**
     * 점수카드를 제외하고 낸다.
     */
    const playNonScore = () => {
        const playable = [];
        this.deck.forEach((card, index) => {
            if(card.isScoreCard()) return;
            else if(card.shape == 'joker') return;
            playable.push(index);
        });
        if(playable.length > 0) return playIndex(_.sample(playable));
        else return playIndex(_.random(0, deck.length - 1));
    };

    /**
     * 이 카드로 선을 잡을 수 있는가?
     */
    const canTakeLeadWith = (index) => {
        const cardStrength = game.calculateCardStrength(deck[index]);
        return (cardStrength > game.maxCardStrength);
    };

    /**
     * 카드가 해당 문양에서 몇위의 순위 정도인지
     */
    const getCardRankInShape = (card) => {
        if(card.equals(game.mighty)) return 0;
        const isMightyShape = (card.shapee == game.mighty.shape) ? 1 : 0;
        const cardNum = card.num;
        const higherCardCount = 14 - cardNum - isMightyShape;
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
        // 주공 초구인 경우
        if(this.isPresident && game.currentTrick == 1) {
            // 짱카를 낸다.
            const mightyShape = game.mighty.shape;
            const firstCardShapes = card.cardShapes
                .filter(shape => {
                    if (shape == 'joker') return false;
                    else if(shape == game.bidShape) return false;  // 공약한 문양은 내지 못한다.
                    const topCardNum = (mightyShape == shape ? 13 : 14);
                    return this.deck.hasCard(card.createCard(shape, topCardNum));
                });

            if (firstCardShapes.length > 0) {
                // 마이티문양 K는 마공의 위험이 있으니까 뒤로 뺀다.
                if (firstCardShapes[0] == mightyShape) {
                    firstCardShapes.splice(0, 1);
                    firstCardShapes.push(mightyShape);
                }
                return playIndex(getShapeRange(deck, firstCardShapes[0])[0]);
            }

            // 그 외엔 부기루다를 뽑으며 마공을 요청한다.
            if(deck.hasShape(this.subGiruda)) {
                return playIndex(getShapeRange(deck, this.subGiruda)[1]);
            }

            // 부기루다가... 없다는건 모두가 기루다거나 초구 마이티/조커를 내야한다는 뜻입니다.
            // 신이 내린 행운이니까 그냥 해봅시다.
            const mightyIndex = deck.indexOf(game.mighty);
            if(mightyIndex != -1) return playIndex(mightyIndex);

            const jokerIndex = deck.indexOf(game.joker);
            if(jokerIndex != -1) return playIndex(jokerIndex);

            // 아 그냥 아무거나 내
            return playIndex(0);
        }

        // 여당인 경우
        if(this.isPresident || this.isFriend) {
            // console.log('z1');
            // 3명 이상 기루다가 안뽑혔다면 기루다를 돌려야합니다.
            let girudaLackingOppCount = 0;
            for (let p = 0; p < 5; p++) {
                if (p == this.selfIndex) continue;
                else if (p == this.president) continue;
                if (this.noShapeInfo[p][game.bidShape]) girudaLackingOppCount++;
            }

            // 기루다가 덜 뽑혔다면
            if (girudaLackingOppCount < 3 && deck.hasShape(game.bidShape)) {
                // 기루다를 돌린다.
                const [gStart, gEnd] = getShapeRange(deck, game.bidShape);
                if (gStart !== null && getCardRankInShape(deck[gStart]) === 0) {  // 기루다 짱카
                    return playIndex(gStart);
                }

                // 조커로라도 기루다를 뽑아보자.
                const jokerIndex = deck.indexOf(game.joker);
                if (jokerIndex != -1) {
                    return playIndex(jokerIndex, game.bidShape);
                }

                // 기루다를 돌린다.
                if(gEnd !== null) return playIndex(gEnd);  // 제일 낮은 기루다.

                // 기루다도 못뽑는 무능한 여당...
                // 프렌이라면 주공에게 없는 문양을 돌린다.
                if(this.isFriend) {
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
                }

                // console.log('z2-4');

                // 너무나도 무능한 여당이다. 점카 아닌걸로 맞자.
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

            // 기루다도 꽤 뽑혔다. 다른 물카처리를 좀 해보자.
            else {
                const partner = (this.isPresident ? game.friend : game.president);
                if(partner !== null) {
                    // 파트너가 대신 턴을 먹어줬으면 좋겠다.
                    // 파트너가 간 칠 기회를 준다.
                    if(!this.noShapeInfo[partner][game.bidShape]) {
                        const pLackingShape = _.sample(
                            Object.keys(this.noShapeInfo[partner])
                                .filter(shape => this.deck.hasShape(shape))
                        );
                        if(pLackingShape !== undefined) {
                            return playIndex(getShapeRange(deck, pLackingShape)[0]);
                        }
                    }
                }

                const mightyIndex = deck.indexOf(game.mighty);
                const jokerIndex = deck.indexOf(game.joker);

                // 조커로 부기루다를 뽑는다.
                if(this.isPresident && jokerIndex != -1 && this.subGiruda) {
                    return playIndex(jokerIndex, this.subGiruda);
                }

                // 조커는 늘 마지막 카든데 그게 2번째 카드
                // 지금 조커가 효과가 있는 마지막 턴이다. 내고 죽자.
                if(jokerIndex == 1) {
                    return playIndex(1, deck[0].shape);
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
            // 조건 : 조커 프렌드거나 17 공약 이상
            if(
                (game.bidCount >= 17 || game.friendCard.equals(game.joker)) &&
                (game.friendType != 'card' || !game.friendCard.equals(game.mighty)) &&
                deck.hasCard(game.jokerCall) &&
                !game.discardedCards.hasShape('joker') &&
                !deck.hasCard(game.joker)  // 내가 조콜/조를 다 가진 야당일 경우엔 콜을 안한다.
            ) {
                // console.log('y_1');
                return playIndex(deck.indexOf(game.jokerCall), undefined, true);
            }

            // console.log('y1');
            // 마이티가 안 뽑혔다면 마공
            const mightyShape = game.mighty.shape;
            if(deck.hasShape(mightyShape) && !game.discardedCards.hasCard(game.mighty)) {
                const msEnd = getShapeRange(deck, mightyShape)[1];
                return playIndex(msEnd);  // 어차피 마공인데 제일 작은걸로 딜 넣는다.
            }

            // console.log('y2');
            // 아니라면 주공에게 있을만한 기루다가 아닌 문양을 돌린다
            // 그런 문양이 다 망하면 주공에게 없는 문양들도 돌린다.
            const pLackingShapes = _.shuffle(Object.keys(this.noShapeInfo[game.president]));
            const pHavingShapes = ['spade', 'heart', 'diamond', 'clover'].filter(
                s => (s != game.bidShape && pLackingShapes.indexOf(s) == -1));
            const pShapes = _.shuffle(pHavingShapes).concat(pLackingShapes);
            // console.log(pShapes);
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

            // console.log('y3');

            // 놀랍게도 여기까지 왔다면 내가 야당 주제에 기루다/마이티/조커만 있다는 뜻이다.
            // 이상황에서는 백런을 노리는게 맞다.

            // 조커가 있다면 기루다 플레이를 해서 주공을 괴롭힌다.
            if(deck[deck.length - 1].shape == 'joker') {
                return playIndex(deck.length - 1, game.bidShape);
            }

            // console.log('y4');
            // 아니면 낮은 기루다/마이티를 계속 돌려준다.
            return playIndex(deck.length - 1);
        }
    }

    // 2. 조커 콜 처리 - 더 고려할게 없다.
    if(msg.jcall) {
        // console.log('x');
        const jokerIndex = deck.indexOf(game.joker);
        if (jokerIndex != -1) {
            // console.log('x1');
            // 조커랑 마이티가 둘 다 있으면 조콜에서도 마이티를 낸다.
            // 조커는 언젠가는 써야하잖아.
            const mightyIndex = deck.indexOf(game.mighty);
            if(mightyIndex != -1) return playIndex(mightyIndex);
            else return playIndex(jokerIndex);
        }
    }

    // 3. 문양 요청시 - 그 문양이 있으면 내야합니다.
    if(msg.shaperq) {
        // console.log('a');
        // cf) (currentTurn - startTurn + 5) % 5 : currentTurn이 startTurn 기준 몇번째 턴인가
        const hasPresidentPlayed = (
            (game.currentTurn - game.startTurn + 5) % 5 >
            (game.president - game.startTurn + 5) % 5
        );  // 주공이 카드를 이미 냈는가?
        const remainingTurns = (this.startTurn - this.currentTurn + 5) % 5 - 1;

        const jokerIndex = deck.indexOf(game.joker);
        const [sStart, sEnd] = getShapeRange(deck, msg.shaperq);

        // 여당이라면
        if (this.isPresident || this.isFriend) {
            // 주공이 해당 문양에서 선을 잡을 수 있다면 주공에게 선을 넘겨준다.
            const partner = (this.isPresident ? game.friend : game.president);
            if(partner !== null) {  // 상대편이 누군지 안다면
                let canPartnerWin = false;

                // 현재 주공이 잠재적인 선이다.
                if (game.trickWinner === partner) {
                    // console.log('b1');
                    const partnerCard = game.playedCards[(game.trickWinner - game.startTurn + 5) % 5];  // 주공이 낸 카드!

                    // 주공이 선플레이어가 아니고 간을 쳤다면 주공이 이기겠지 뭐
                    if (
                        game.president != game.startTurn &&
                        msg.shaperq !== game.bidShape &&
                        partnerCard.shape == game.bidShape
                    ) {
                        canPartnerWin = true;
                    }

                    // 그 외 : 주공이 낸게 주공 카드 문양중에 짱칸지를 봐야한다.
                    else {
                        // 조커는 짱카 가정
                        if (partnerCard.shape == 'joker') canPartnerWin = true;

                        // 주공이 해당 문양에서 짱카를 냈는가? (내 덱 제외)
                        else {
                            const presidentCardRank = getCardRankInShape(partnerCard);
                            const myDeckPWC = deck.filter(
                                (c) => (c.shape == msg.shaperq && c.num > partnerCard.num)
                            ).length;  // 내 덱 카드중 주공 카드를 밟는 갯수

                            if (presidentCardRank == myDeckPWC) {
                                // 주공이 내 덱 제외 짱카다.
                                canPartnerWin = true;
                            }
                        }
                    }
                }

                // 주공이 이길것같으면 제일 낮은 카드를 낸다.
                if (canPartnerWin) {
                    // console.log('b3');
                    if (sEnd !== null) return playIndex(sEnd);
                    // 그냥 주공에게 어떻게든 턴을 넘겨줘야 하니까 기루다/마이티/조커 빼고 암거나 낸다.
                    else return playNonMJG();
                }

                // 주공이 뒤에 턴을 잡는다. 주공이 물카 털 기회를 줍시다.
                if (this.isFriend && !hasPresidentPlayed) {
                    // 문양으로 선을 먹을 수 있으면 제일 높은 문양을 낸다.
                    if (sStart !== null && canTakeLeadWith(sStart)) return playIndex(sStart);

                    // 간을 칠 수 있고 기루다 플레이를 할 수 있으면 제일 높은 간을 친다.
                    if (sStart === null && deck.hasShape(game.bidShape)) {
                        const gStart = getShapeRange(deck, game.bidShape)[0];
                        return playIndex(gStart);
                    }
                }
            }

            // console.log('b4');
            // 기루다를 내야 하고 내가 더 높은 기루다를 낼 수 있으면 기루다를 낸다.
            if (sStart !== null && msg.shaperq == game.bidShape && canTakeLeadWith(sStart)) {
                // console.log('c1');
                return playIndex(sStart);
            }

            // 마이티가 있으면 밟아준다.
            if (deck.hasCard(game.mighty)) {
                // console.log('c2');
                return playIndex(deck.indexOf(game.mighty));
            }

            // 조커가 있어도 밟아준다.
            if (
                game.currentTrick != 1 && game.currentTrick != 10 &&
                deck.hasCard(game.joker)
            ) {
                // console.log('c3');
                return playIndex(deck.indexOf(game.joker));
            }

            // 그냥 선을 먹을 수 있으면 선을 낸다.
            if (sStart !== null) {
                // console.log('c4');
                // 내가 선을 먹을 수 있다면 제일 쎈걸로
                // (더 쎈걸로 밟힐수도 있으니까 어중간한게 쎈거 말고 그냥 제일 쎈걸로 낸다)
                if (getCardRankInShape(deck[sStart]) === 0) return playIndex(sStart);
                // 아님 야당에게 힘 실어주지 말고 제일 낮은거 내자.
                else return playIndex(sEnd);
            }

            else {
                // console.log('c5');
                // 주공이 간을 칠 수 있으면 주공을 믿는다.
                if (
                    this.isFriend &&
                    !this.noShapeInfo[game.president][game.bidShape] &&
                    this.noShapeInfo[game.president][msg.shaperq]
                )  return playNonMJG();  // 기루다 빼고 낸다

                // console.log('c5_1');

                // 아니면 간을 쳐야한다.
                const [gStart, gEnd] = getShapeRange(deck, game.bidShape);
                if (gStart !== null) {
                    if(this.isFriend) return playIndex(gStart);
                    else return playIndex(gEnd);
                }

                // console.log('c5_2');

                // 할 수 있는것도 없다. 점수나 싣지 말자.
                return playNonScore();
            }
        }

        // 야당이라면 전략이 달라진다.
        else {
            // console.log('d');
            let isLeadingTeamWinning = false;
            // 내가 주공/프렌드를 밟을 수 있으면 밟는다.
            if (
                game.trickWinner === game.president ||
                game.trickWinner === game.friend
            ) {
                // console.log('d1');
                isLeadingTeamWinning = true;

                // 여당을 간신히 이길정도의 카드를 낸다.
                if(sStart !== null) {
                    if (canTakeLeadWith(sStart)) {
                        let minimumWinnerIndex = sStart;
                        while (minimumWinnerIndex < sEnd) {
                            if (!canTakeLeadWith(minimumWinnerIndex + 1)) break;
                            minimumWinnerIndex++;
                        }
                        return playIndex(minimumWinnerIndex);
                    }
                    else {
                        return playIndex(sEnd);
                    }
                }

                // console.log('d1_1');

                // 간/엇간을 친다.
                const [gStart, gEnd] = getShapeRange(deck, game.bidShape);
                // console.log('d1_1_1');
                if(gStart !== null && canTakeLeadWith(gStart)) {
                    let minimumWinnerIndex = gStart;
                    while (minimumWinnerIndex < gEnd) {
                        if (!canTakeLeadWith(minimumWinnerIndex + 1)) break;
                        minimumWinnerIndex++;
                    }
                    return playIndex(minimumWinnerIndex);
                }
            }

            // console.log('d01');

            // 조커가 있는데 점수가 2개 이상 쌓일 수 있을것같으면 조커를 낸다.
            if (this.currentTrick != 1 && this.currentTrick != 10 && jokerIndex != -1) {
                // console.log('d2');
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
                if (expectedScoreCount >= 2) {
                    // 마이티가 나왔으면
                    if (!game.playedCards.hasCard(game.mighty)) {
                        return playIndex(jokerIndex);
                    }
                }
            }

            // console.log('d02');

            // 주공이 이미 냈을경우 : 주공이 무섭지 않다.
            // 점수를 마구마구 실어주자.
            if (!isLeadingTeamWinning && hasPresidentPlayed) {
                // console.log('d3');
                if(sStart !== null) {
                    // console.log('d3_1');
                    let minimumScoreCard = sStart;
                    while (minimumScoreCard < sEnd) {
                        if (!deck[minimumScoreCard + 1].isScoreCard()) break;
                        minimumScoreCard++;
                    }
                    return playIndex(minimumScoreCard);  // 야당/안밝혀진 프렌에겐 점수를 싣는다.
                }
                else { // 기루다가 아닌 아무 점수나 내자.
                    // console.log('d3_2');
                    const playable = [];
                    this.deck.forEach((card, index) => {
                        if(card.shape == game.bidShape) return;
                        if(card.isScoreCard()) playable.push(index);
                    });
                    if(playable.length > 0) playIndex(_.sample(playable));
                }
            }

            // console.log('d03');

            // 마프고 조커가 안 빠졌고 (조커가 야당에게 있겠지? 란 기대로)
            // 내가 2번째 턴이고 첫턴이 점카고 조커가 안 빠졌으면 이 턴에 실어주는걸 고려해봐야한다.
            // 이 짓은 최대 2번만 한다. 그 안에 조커가 안나오면 조커가 주공이나 프렌에게 있다 가정한다.
            if (
                this.trustOpponentHavingJoker < 2 &&
                remainingTurns == 3 &&
                game.mighty.equals(game.friendCard) &&
                game.playedCards[0].isScoreCard() &&
                Math.random() < 0.7 &&  // 70% 확률로 싣는다.
                !game.discardedCards.hasShape('joker')
            ) {
                // console.log('d4');
                let minimumScoreCard = null;

                // 문양중 제일 작은 점수카드.
                if(sStart !== null && deck[sStart].isScoreCard()) {
                    minimumScoreCard = sStart;
                    while (minimumScoreCard < sEnd) {
                        if (!deck[minimumScoreCard + 1].isScoreCard()) break;
                        minimumScoreCard++;
                    }
                }

                else { // 기루다가 아닌 아무 점수카드.
                    const playable = [];
                    this.deck.forEach((card, index) => {
                        if(card.shape == game.bidShape) return;
                        if(card.isScoreCard()) playable.push(index);
                    });
                    if(playable.length > 0) minimumScoreCard =_.sample(playable);
                }

                // console.log('d4_1');

                if(minimumScoreCard !== null) {
                    // 지금 돌고있는게 기루다면 J/10만 싣는다.
                    if (msg.shaperq == game.bidShape) {
                        // console.log('d4_1_1');
                        const cardNum = deck[minimumScoreCard].num;
                        if (cardNum == 10 || cardNum == 11) {
                            this.trustOpponentHavingJoker++;
                            return playIndex(minimumScoreCard);
                        }
                    }

                    // 아니면 그냥 제일 낮은 점카를 싣는다.
                    else {
                        // console.log('d4_1_2');
                        this.trustOpponentHavingJoker++;
                        return playIndex(minimumScoreCard);
                    }
                }
            }

            // console.log('d5');

            // 그냥 제일 낮은 카드를 싣는다.
            if(sEnd !== null) return playIndex(sEnd);
            else return playNonScore();
        }
    }

    // 여기까지 왔으면 아마 조커로 문양지정 없이 냈겠지..?
    // 나도 모르겠다. 아무거나 낸다.
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
            // global.logger.debug(`player #${msg.player} don't have ${currentShapeRequest}`);
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
