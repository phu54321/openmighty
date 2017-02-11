/**
 * Created by whyask37 on 2017. 1. 14..
 */

/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const async = require('async');

const cmdout = require('./../io/cmdout');
const card = require('./card');
const setCheck = require('./setcheck');

const gamelog = require('../../models/gamelog');
const users = require('../../models/users');

module.exports = function (MightyRoom) {
    /**
     * 메인 게임을 시작합니다.
     */
    MightyRoom.prototype.startMainGame = function () {
        this.playState = 'mainGame';

        // 프렌드 선정 단계까지는 기루다가 중간에 바뀔 수 있어서
        // 게임이 시작하기 직전인 여기서 특수카드들을 확정합니다.
        this.setSpecialCards();

        // 초기화
        this.currentTrick = 0;
        this.obtainedCards = [[], [], [], [], []];
        this.startTurn = this.president;
        this.startNewTrick();
    };

    /**
     * 특수카드들을 설정합니다.
     */
    MightyRoom.prototype.setSpecialCards = function () {
        // 특수카드들
        this.mighty = card.createCard(
            (this.bidShape == 'spade') ? 'diamond' : 'spade',
            14
        );
        this.jokerCall = card.createCard(
            (this.bidShape == 'clover') ? 'spade' : 'clover',
            3
        );
        this.joker = card.createCard('joker');
    };


    /**
     * 새로운 트릭(마이티에는 10개의 트릭이 있습니다)을 시작합니다.
     */
    MightyRoom.prototype.startNewTrick = function () {
        this.currentTrick++;
        this.playedCards = [];
        this.currentTurn = this.startTurn;
        this.maxCardStrength = -1;
        this.jokerCalled = false;
        this.trickWinner = null;
        this.shapeRequest = null;
        cmdout.emitGameCardPlayRequest(this);
    };


    /**
     * 유저가 카드를 냈을 때를 처리합니다.
     */
    MightyRoom.prototype.onCardPlay = function (userEntry, msg) {
        if(!this.playing || this.playState != 'mainGame') return "본게임중이 아닙니다.";
        if(this.gameUsers[this.currentTurn] != userEntry) return "낼 차례가 아닙니다.";

        // 인덱스 처리
        if(typeof msg.cardIdx != "number") return "잘못된 카드입니다.";
        const cardIdx = msg.cardIdx | 0;
        if(cardIdx < 0 || cardIdx >= userEntry.deck.length) return "잘못된 카드입니다.";

        const playingCard = userEntry.deck[cardIdx];

        // 조커콜이 정당한지 처리
        const isJokerCall = Boolean(msg.jcall);
        if(isJokerCall) {
            if(!playingCard.equals(this.jokerCall)) return "잚못된 조커콜입니다.";
        }

        // 조커로 문양을 부를 수 있는지 처리
        const jokerShapeRequest = msg.srq;
        if(jokerShapeRequest) {
            if(!playingCard.equals(this.joker)) return "잘못된 조커입니다.";
            else if(this.currentTurn != this.startTurn) return "첫 턴에만 문양을 부를 수 있습니다.";
            else if(msg.srq == 'joker') return "조커로 조커를 콜 할 수 없습니다.";
            else if(card.cardShapes.indexOf(msg.srq) == -1) return "잘못된 문양입니다.";
        }
        // 낼 수 없는 카드 처리
        if(!this.canPlayCard(playingCard)) return "낼 수 없는 카드입니다.";


        //////////////////////////////////////////////////////////////////////////////////////


        // 카드 처리
        userEntry.deck.splice(cardIdx, 1);
        this.playedCards.push(playingCard);

        // maxCard & maxPlayer를 업데이트
        const cardStrength = this.calculateCardStrength(playingCard);
        if(this.trickWinner === null || this.maxCardStrength < cardStrength) {
            this.maxCardStrength = cardStrength;
            this.trickWinner = this.currentTurn;
        }

        // 카드 프렌드 처리
        if(
            this.friend === null &&
            this.friendType == 'card' &&
            this.friendCard.equals(playingCard)
        ) {
            this.friend = this.currentTurn;
        }

        // 조커콜 처리
        if(isJokerCall) this.jokerCalled = true;

        // 문양 처리
        if(jokerShapeRequest) {
            this.shapeRequest = jokerShapeRequest;
            cmdout.emitJokerRequest(this);
        }

        else if(this.startTurn == this.currentTurn) {
            this.shapeRequest = playingCard.shape;
        }

        // 카드 관련 처리
        // cf) AISocket에서 this.shapeRequest를 카운팅에 활용하기 때문에
        // shapeRequest 업데이트 후 emitGamePlayerCardPlay를 불러야한다.
        cmdout.emitGamePlayerDeck(this, this.currentTurn);
        cmdout.emitGamePlayerCardPlay(this, this.currentTurn, playingCard, isJokerCall);

        // 턴 업데이트
        this.currentTurn = (this.currentTurn + 1) % 5;
        if(this.currentTurn == this.startTurn) this.onTrickEnd();
        else {
            cmdout.emitGameCardPlayRequest(this);
        }
        return null;
    };


    /**
     * 플레이어가 해당 카드를 낼 수 있는지를 본다.
     */
    MightyRoom.prototype.canPlayCard = function (card) {
        const playerDeck = this.gameUsers[this.currentTurn].deck;

        // 마이티와 조커는 는 언제나 허용
        if(card.equals(this.mighty)) return true;
        else if(card.equals(this.joker)) return true;

        // 선플레이어. 웬만하면 다 허용
        if(this.currentTurn == this.startTurn) {
            // 주공은 모든 패가 기루다가 아닌 이상 기루다를 첫 턴에 낼 수 없다.
            if(this.currentTrick === 1 && card.shape == this.bidShape) {
                return _.every(playerDeck, (card) => card.shape == this.bidShape);
            }
            // 그 외엔 허용
            return true;
        }

        // 그 외
        else {
            // 조커콜이면 조커를 내야한다. 조커 처리는 위에서 했으니까 여기까지 넘어왓으면 card는 조커가 아닐것이다
            if (this.jokerCalled && playerDeck.hasShape('joker')) return false;

            // 부른 카드가 있다면 허용
            const shapeRequest = this.shapeRequest;

            if (
                card.shape != shapeRequest &&
                playerDeck.hasShape(shapeRequest)
            ) return false;

            // 그 외엔 허용
            return true;
        }
    };


    /**
     * 지금 게임 상황을 고려해서 해당 카드의 세기를 계산합니다.
     * @returns {number}
     */
    MightyRoom.prototype.calculateCardStrength = function (card) {
        // 점수계산법
        // 0: 아무 점수도 없는 카드
        // 2~14 : 처음 낸 문양과 동일한 문양
        // 102~114 : 기루다 문양과 동일한 문양
        // 100: 첫번째 트릭에서 선플레이어가 낸 기루다
        // 200 : 조커
        // 300 : 마이티
        const firstCard = this.playedCards[0];

        // 마이티 처리
        if(card.equals(this.mighty)) return 300;

        // 조커 처리
        if(card.shape == 'joker') {
            if(this.jokerCalled) return 0;  // 조커콜
            else if(this.currentTrick == 1 || this.currentTrick == 10) return 0;  // 처음/마지막 턴
            else return 200;  // 그 외
        }

        // 선플레이어가 첫번째 턴에 기루다를 냈을 경우
        if(
            this.currentTrick == 1 &&
            this.currentTurn == this.startTurn &&
            card.shape == this.bidShape
        ) return 100;

        // 그 외
        if(card.shape == this.bidShape) return 100 + card.num;  // 기루다의 경우
        else if(card.shape == firstCard.shape) return card.num;
        else return 0;
    };


    /**
     * 한번의 트릭이 끝났을 경우.
     */
    MightyRoom.prototype.onTrickEnd = function () {
        // 낸 카드를 업데이트하고, 각 플레이어가 얻은 점수 카드를 업데이트한다.
        const winnerObtainedCards = this.obtainedCards[this.trickWinner];
        this.playedCards.forEach((card) => {
            this.discardedCards.push(card);
            if(card.isScoreCard()) winnerObtainedCards.push(card);
        });
        this.discardedCards.sort();


        // 초구 프렌드 처리
        if(
            this.friendType == 'first' &&
            this.friend === null &&
            this.trickWinner != this.president &&
            this.currentTrick <= 1
        ) {
            this.friend = this.trickWinner;
        }

        // 게임 종료시
        if(this.currentTrick == 10) {
            this.onGameEnd();
            return;
        }

        // startTurn을 업데이트한다.
        this.startTurn = this.trickWinner;

        const setUser = setCheck(this);
        if(setUser !== null) {
            this.onGameEnd(setUser);
            return;
        }

        cmdout.emitGameTrickEnd(this, this.trickWinner);
        this.startNewTrick();
    };

    /**
     * 게임이 끝났을 경우
     */
    MightyRoom.prototype.onGameEnd = function (setUser) {
        let oppObtainedCardCount = 0;
        for(let i = 0 ; i < 5 ; i++) {
            if(i != this.president && i != this.friend) {
                oppObtainedCardCount += this.obtainedCards[i].length;
            }
        }

        // set으로 끝났으면
        if(setUser !== undefined) {
            // 카드 프렌드였으면 해당 카드가 남은 플레이어를 프렌드로 지정
            if(this.friend === null && this.friendType == 'card') {
                for (let i = 0; i < 5; i++) {
                    if (this.gameUsers[i].deck.hasCard(this.friendCard)) {
                        this.friend = i;
                        break;
                    }
                }
            }

            // 야당이 set했으면 모든 남은 점카를 준다.
            if(setUser != this.president && setUser != this.friend) {
                for(let i = 0 ; i < 5 ; i++) {
                    const deck = this.gameUsers[i].deck;
                    for(let j = 0 ; j < deck.length ; j++) {
                        if(deck[j].num >= 10) oppObtainedCardCount++;
                    }
                }
            }
        }

        // 점수 계산
        const scoreTable = [0, 0, 0, 0, 0];
        const leadingTeamCardCount = 20 - oppObtainedCardCount;
        let leadingTeamScore;

        if(leadingTeamCardCount >= this.bidCount) {
            leadingTeamScore = leadingTeamCardCount + this.bidCount - 26;
        }
        else {
            leadingTeamScore = this.bidCount - leadingTeamCardCount;
            if(oppObtainedCardCount >= 11) leadingTeamScore *= 2;  // 백런
            leadingTeamScore = -leadingTeamScore;
        }

        // 마이티 공약을 여러개 보면서 런 공약을 안했더라도 주공이 기본적으로 런을 목표로 하도록
        // 보통 룰대로 예고 런 뿐만 아니라 어쩌다 된 런에도 2배 점수를 적용하기로 했습니다.
        if(leadingTeamScore == 20) {  // 런
            if(this.bidShape == 'none') leadingTeamScore *= 3;  // 노기루다 런은 *2*2가 아니라 *1.5만 한다.
            else leadingTeamScore *= 2;
        }
        else if(this.bidShape == 'none') leadingTeamScore *= 2;  // 노기루다

        if(this.friend === null) {
            for(let i = 0 ; i < 5 ; i++) {
                if(i == this.president) scoreTable[i] = leadingTeamScore * 4;
                else scoreTable[i] = -leadingTeamScore;
            }
        }
        else {
            for(let i = 0 ; i < 5 ; i++) {
                if(i == this.president) scoreTable[i] = leadingTeamScore * 2;
                else if(i == this.friend) scoreTable[i] = leadingTeamScore;
                else scoreTable[i] = -leadingTeamScore;
            }
        }

        this.scores = scoreTable;

        // Scores
        global.logger.info(`End game #${this.roomID}`);

        // Apply ratings
        async.series([
            (cb) => this.gamelog.addUserGameLogs(cb),
            (cb) => async.eachSeries(this.users, (user, next) => {
                // Update user's rating
                users.getUserRating(user.useridf, (err, rating) => {
                    if (err) return next(err);
                    user.rating = rating;
                    next(null);
                });
            }, cb),
        ], (err) => {
            cmdout.emitGameEnd(this, oppObtainedCardCount, scoreTable, setUser);
            if (!err) cmdout.emitRoomUsers(this);
            this.endGame();
            if (err) throw err;
        });
    };
};
