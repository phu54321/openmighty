/**
 * Created by whyask37 on 2017. 1. 14..
 */

/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const cmdout = require('./../io/cmdout');
const mutils = require('./mutils');


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
        this.mighty = mutils.createCard(
            (this.bidShape == 'spade') ? 'diamond' : 'spade',
            14
        );
        this.jokerCall = mutils.createCard(
            (this.bidShape == 'clover') ? 'spade' : 'clover',
            3
        );
        this.joker = mutils.createCard('joker');
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
        cmdout.emitGameCardPlayRequest(this);
    };


    /**
     * 유저가 카드를 냈을 때를 처리합니다.
     */
    MightyRoom.prototype.onCardPlay = function (userEntry, cardIdx, isJokerCall) {
        if(!this.playing || this.playState != 'mainGame') return "본게임중이 아닙니다.";
        if(this.gameUsers[this.currentTurn] != userEntry) return "낼 차례가 아닙니다.";

        // 인덱스 처리
        if(typeof cardIdx != "number") return "잘못된 카드입니다.";
        cardIdx = parseInt(cardIdx);
        if(cardIdx < 0 || cardIdx >= userEntry.deck.length) return "잘못된 카드입니다.";

        const playingCard = userEntry.deck[cardIdx];

        // 조커콜이 정당한지 처리
        if(isJokerCall) {
            if(!playingCard.equals(this.jokerCall)) return "잚못된 조커콜입니다.";
            isJokerCall = true;
        }
        else isJokerCall = undefined;


        // 낼 수 없는 카드 처리
        if(!this.canPlayCard(playingCard)) return "낼 수 없는 카드입니다.";


        // 카드 처리
        userEntry.deck.splice(cardIdx, 1);
        this.playedCards.push(playingCard);
        cmdout.emitGamePlayerDeck(this, this.currentTurn);
        cmdout.emitGamePlayerCardPlay(this, this.currentTurn, playingCard, isJokerCall);

        // maxCard & maxPlayer를 업데이트
        const cardStrength = this.calculateCardStrength(playingCard);
        if(this.trickWinner === null || this.maxCardStrength < cardStrength) {
            this.maxCardStrength = cardStrength;
            this.trickWinner = this.currentTurn;
        }

        // 조커콜 처리
        if(isJokerCall) this.jokerCalled = true;

        // 턴 업데이트
        this.currentTurn = (this.currentTurn + 1) % 5;
        if(this.currentTurn == this.startTurn) this.onTrickEnd();
        else cmdout.emitGameCardPlayRequest(this);
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
            if (this.jokerCalled && mutils.hasShapeOnDeck('joker', playerDeck)) return false;

            // 맨 처음 카드 모양이 있으면 그걸 내야한다.
            const firstCard = this.playedCards[0];
            if (
                card.shape != firstCard.shape &&
                mutils.hasShapeOnDeck(firstCard.shape, playerDeck)
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
        const winnerObtainedCards = this.obtainedCards[this.trickWinner];

        // 지금까지 모아진 카드중에 점수카드를 승자에게 준다.
        this.playedCards.forEach((card) => {
            if(card.num >= 10) winnerObtainedCards.push(card);
        });

        // 게임 종료시
        if(this.currentTrick == 10) {
            this.onGameEnd();
            return;
        }

        cmdout.emitGameTrickEnd(this);
        this.startTurn = this.trickWinner;
        this.startNewTrick();
    };

    /**
     * 게임이 끝났을 경우
     */
    MightyRoom.prototype.onGameEnd = function () {
        let oppObtainedCardCount = 0;
        for(let i = 0 ; i < 5 ; i++) {
            if(i != this.president && i != this.friend) {
                oppObtainedCardCount += this.obtainedCards[i].length;
            }
        }

        cmdout.emitGameEnd(this, oppObtainedCardCount);
        this.endGame();
    };
};