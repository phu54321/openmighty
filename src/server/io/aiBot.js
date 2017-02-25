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

    this.playSpeed = playSpeed || 600;
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
        global.logger.error(this.userEntry.useridf, 'err', msg);
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

        // 한턴정도 프렌이 해주겠지
        if(winExpect <= 7) winExpect++;

        // 최대치 기록
        if(maxWinExpect < winExpect) {
            maxWinExpect = winExpect;
            maxWinExpectShape = bidShape;
        }
    });

    if(maxWinExpect === 0) this.biddingCache = null;
    else {
        this.biddingCache = {
            bidCount: Math.min(20 - ((10 - maxWinExpect) * 2.3), 20) | 0,
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
        let bidCount = bidCandidate.bidCount;
        if(bidCount >= 18) bidCount = 20;  // 18개면 그냥 20개를 달리자;
        let maxBidCount = Math.min(20, bidCount + 2);  // 주어오는거에서 1개 더 나오리라 믿는다.

        while(bidCount <= maxBidCount) {
            const myBidStrength = bidding.getBidStrength(bidShape, bidCount);
            global.logger.debug(this.deck.toString(), bidShape, bidCount, myBidStrength, this.game.bidding.bidStrength);
            if (myBidStrength > this.game.bidding.bidStrength) {
                return this.cmd({
                    type: 'bid',
                    shape: bidShape,
                    num: bidCount
                });
            }
            bidCount++;
        }
    }

    if(this.game.bidding.canDealMiss && this.deck.getDealMissScore() <= 0.51) {
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
            (this.game.bidShape != bidShape && newBidStrength <= this.game.bidStrength + 1) ||
            (this.game.bidShape == bidShape && bidCount < this.game.bidCount)
        )) {
        if (!(bidShape == this.game.bidShape && bidCount == this.game.bidCount)) {
            msg.bidch2 = {
                shape: bidShape,
                num: bidCount
            };
        }
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
        msg.shape = bidShape;
        msg.num = 14;
    }

    // 기루다 K
    else if (!this.deck.hasCard(card.createCard(bidShape, 13))) {
        msg.shape = bidShape;
        msg.num = 13;
    }

    // 부기루다 A
    else if (!this.deck.hasCard(card.createCard(subGiruda, 14))) {
        msg.shape = subGiruda;
        msg.num = 14;
    }

    // 부기루다 K
    else if (!this.deck.hasCard(card.createCard(subGiruda, 13))) {
        msg.shape = subGiruda;
        msg.num = 13;
    }

    // 부기루다A로 초구 돌리겠지 뭐
    else {
        msg.ftype = 'none';
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

    const play = (score, srq, jcall) => {
        return [score, srq, jcall];
    };

    const playScored = (cb) => {
        let scores = deck.map(cb).map(s => {
            if(Array.isArray(s)) return s;
            else return [s];
        });
        const scoreRank = _.shuffle(_.range(scores.length));
        scoreRank.sort((a, b) => scores[b][0] - scores[a][0]);

        for(let i = 0 ; i < scoreRank.length ; i++) {
            const idx = scoreRank[i];
            console.log(deck[idx].toString(), scores[idx][0]);
        }

        const idx = scoreRank[0];
        return playIndex(idx, scores[idx][1], scores[idx][2]);
    };


    /**
     * 마이티/조커/기루다를 제외하고 아무거나 낸다.
     */
    const playNonMJG = () => {
        playScored((card) => {
            if(card.equals(game.mighty)) return -200;
            else if(card.shape == 'joker') return -100;
            else if(card.shape == game.bidShape) return -50;
            else return 0;
        });
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
        if(card.equals(game.mighty)) return -1;
        const isMightyShape = (card.shape == game.mighty.shape) ? 1 : 0;
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
            return playScored((card) => {
                // 기루다는 못낸다.
                if(card.shape == game.bidShape) return -500 + card.num;

                // 짱카 우선시
                if(getCardRankInShape(card) === 0) {
                    if(card.shape == game.mighty.shape) return 200;  // 마공 위험이 있으므로 약간 점수 낮게
                    else return 201;
                }

                // 부기루다, 낮은 카드 우선시
                else if(card.shape == this.subGiruda) {
                    return 100 - card.num;
                }

                else if(card.equals(game.mighty)) return -10;  // 마이티 지양
                else if(card.num == 10 || card.num == 11) return -100;  // 10, J는 더 지양
                else if(card.num == 12 || card.num == 13) return -200;  // Q, K는 나중에 짱카가 되니까 더 더 지양
                else if(card.shape == 'joker') return -300;  // 조커는 완전 지

                else return 0;
            });
        }

        // 여당인 경우
        if(this.isPresident || this.isFriend) {
            // 3명 이상 기루다가 안뽑혔다면 기루다를 돌려야합니다.
            let girudaLackingOppCount = 0;
            for (let p = 0; p < 5; p++) {
                if (p == this.selfIndex) continue;
                else if (p == this.president) continue;
                if (this.noShapeInfo[p][game.bidShape]) girudaLackingOppCount++;
            }

            // 기루다가 덜 뽑혔다면
            if (girudaLackingOppCount < 3 && deck.hasShape(game.bidShape)) {
                return playScored((card) => {
                    if(card.shape == game.bidShape) {
                        if(getCardRankInShape(card) === 0) return 300;  // 기루다 짱카
                        else if(this.isFriend) return 200 + card.num;  // 프렌은 높은 기루다부터
                        else return 200 - card.num;  // 주공은 낮은 기루다부터
                    }
                    else if(card.shape == 'joker') {
                        // 기루다 짱카가 프렌인 경우는 조커로 기루다를 돌리지 않습니다.
                        if(!(
                            game.friendCard &&
                            game.friendCard.shape == game.bidShape &&
                            getCardRankInShape(game.friendCard) === 0
                        )) return play(250, game.bidShape);
                    }
                    else if(card.equals(game.mighty)) return -100;  // 마이티 초구는 X

                    // 낮은 카드로 주공이 간을 칠 수 있도록 한다.
                    else if(this.isFriend && this.noShapeInfo[game.president][card.shape]) {
                        return 150 - card.num;
                    }

                    // 점카가 아닌걸로 내자.
                    else if(!card.isScoreCard()) return 100;

                    // 어쩔 수 없지
                    else return 0;
                });
            }

            // 기루다도 꽤 뽑혔다. 다른 물카처리를 좀 해보자.
            else {
                return playScored((card) => {
                    // 다른 문양 짱카
                    if(getCardRankInShape(card) === 0) return 300;

                    // 파트너 간 믿기
                    const partner = (this.isFriend) ? game.president : game.friend;
                    if(partner !== null) {
                        if (!this.noShapeInfo[partner][game.bidShape]) {
                            if (this.noShapeInfo[partner][card.shape]) return 200 - card.num;
                        }
                    }

                    // 조커
                    if(card.shape == 'joker') {
                        if(deck.length == 2) return play(9999, deck[0].shape);  // 마지막에서 2번째에 턴다
                        else if(this.subGiruda) return play(250, this.subGiruda);  // 부기루다 콜
                    }

                    // 점카가 아닌걸로 내자.
                    if(!card.isScoreCard()) return 100;

                    if(card.equals(game.mighty)) return -100;  // 마이티는... 나중에 씁시다.

                    // 어쩔 수 없지
                    else return 0;
                });
            }
        }

        // 야당의 전략
        else {
            const hasJoker = deck.hasShape('joker');
            const jokerDiscarded = game.discardedCards.hasCard(game.joker);
            const mightyDiscarded = game.discardedCards.hasCard(game.mighty);
            return playScored((card) => {
                // 조커 프렌드거나 17 공약 이상인 경우 여당에게 조커가 있을 가능성 농후
                if(
                    card.equals(game.jokerCall) &&
                    !hasJoker &&
                    (game.bidCount >= 17 || game.friendCard.equals(game.joker)) &&
                    !jokerDiscarded
                ) {
                    return play(9999, undefined, true);  // 무조건 조커콜!
                }

                if(!mightyDiscarded) {  // 마공
                    if(card.shape == game.mighty.shape) {
                        return 1000 - card.num;
                    }
                }

                // 주공이 가지고있을만한 문양
                if(!this.noShapeInfo[game.president][card.shape]) {
                    return 500 + card.num;
                }

                if(card.equals(game.joker)) return -100;
                if(card.equals(game.mighty)) return -50;
                if(card.isScoreCard()) return -20;
                return -card.num;
            });
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
                    if (sEnd !== null) return playIndex(sEnd);
                    // 그냥 주공에게 어떻게든 턴을 넘겨줘야 하니까 기루다/마이티/조커 빼고 암거나 낸다.
                    else return playNonMJG();
                }

                // 주공이 뒤에 턴을 잡는다. 주공이 물카 털 기회를 줍시다.
                if (this.isFriend && !hasPresidentPlayed) {
                    // 문양으로 선을 먹을 수 있으면 제일 높은 문양을 낸다.
                    if (sStart !== null && getCardRankInShape(deck[sStart]) === 0) return playIndex(sStart);

                    // 간을 칠 수 있고 기루다 플레이를 할 수 있으면 제일 높은 간을 친다.
                    if (sStart === null && deck.hasShape(game.bidShape)) {
                        const gStart = getShapeRange(deck, game.bidShape)[0];
                        return playIndex(gStart);
                    }
                }
            }

            return playScored((card, index) => {
                if(card.equals(game.mighty)) return 5001;
                if(card.equals(game.joker)) {
                    if(game.currentTrick == 9) return 5002;
                    else return 5000;
                }

                // 카드를 낼 수 있다면
                if(msg.shaperq == card.shape) {
                    if(getCardRankInShape(card) === 0) return 9999; // 짱카를 낼 수 있으면 낸다
                    else if(card.isScoreCard()) return 1000;  // 점수는 싣지 않는다
                    else if(canTakeLeadWith(index)) return 1200;  // 밟을 수 있으면 밟는다
                    else return 1100 - card.num;  // 낮은 문양부터 낸다
                }

                else {
                    // 간을 칠 수 있으면 친다.
                    if(card.shape == game.bidShape) {
                        if(card.num == 12 || card.num == 13) return 500;  // KQ는 일단 남기자
                        if(card.num == 10 || card.num == 11) return 530;  // J10은 턴다 (주공에게 준다)
                        return 500 + card.num;
                    }

                    // 같은 편까지 가야한다면
                    if(partner !== null) {
                        // 같은 편을 믿자
                        if(
                            !this.noShapeInfo[partner][game.bidShape] &&
                            this.noShapeInfo[partner][msg.shaperq]) {
                            if(card.num == 12 || card.num == 13) return 0;  // KQ는 일단 남기자
                            if(card.num == 10 || card.num == 11) return 200;  // J10은 턴다 (주공에게 준다)
                            else return 100 - card.num;  // 나머지는 비등비등..
                        }
                    }

                    // 점수 싣지 말자.
                    return 50 - card.num;
                }
            });
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
                if(this.currentTrick == 9) return playIndex(jokerIndex);  // 9번 턴에선 무조건 조커
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
                return playScored((card) => {
                    let shapeScore = (card.shape == game.bidShape) ? 0 : 100;
                    if(card.shape == msg.shaperq) shapeScore += 1000;

                    if(card.equals(game.mighty)) return -500;
                    if(card.num == 10 || card.num == 11 || card.num == 12) return shapeScore + 20 + card.num;
                    if(card.num == 13) return shapeScore + 20;
                    if(card.num == 14) return shapeScore + 15;
                    return shapeScore - card.num;
                });
            }

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
                return playScored((card) => {
                    let shapeScore = (card.shape == game.bidShape) ? 0 : 100;
                    if(card.shape == msg.shaperq) shapeScore += 1000;

                    if(card.equals(game.mighty)) return -500;
                    if(card.num == 10 || card.num == 11 || card.num == 12) return shapeScore + 20 + card.num;
                    if(card.num == 13) return shapeScore + 20;
                    if(card.num == 14) return shapeScore + 15;
                    return shapeScore - card.num;
                });
            }

            // 조커를 쓴다
            if(game.currentTrick == 9 && jokerIndex != -1) {
                return playIndex(jokerIndex);
            }

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
