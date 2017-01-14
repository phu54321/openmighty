/**
 * Created by whyask37 on 2017. 1. 14..
 */

/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const cmdout = require('./../io/cmdout');

module.exports = function (MightyRoom) {
    /**
     * 메인 게임을 시작합니다.
     */
    MightyRoom.prototype.startMainGame = function () {
        this.playState = 'mainGame';
        this.startTurn = this.president;
        this.currentTrick = 0;
        this.obtainedCards = [[], [], [], [], []];

        this.startNewTrick();
    };

    /**
     * 새로운 트릭(마이티에는 10개의 트릭이 있습니다)을 시작합니다.
     */
    MightyRoom.prototype.startNewTrick = function () {
        this.currentTrick++;
        this.playedCards = [];
        this.currentTurn = this.startTurn;
        this.maxCardScore = -1;
        this.trickWinner = null;
        cmdout.emitGameCardPlayRequest(this);
    };

    /**
     * 유저가 카드를 냈을 때를 처리합니다.
     */
    MightyRoom.prototype.onCardPlay = function (userEntry, cardIdx, isJokerCall) {
        if(!this.playing || this.playState != 'mainGame') return "본게임중이 아닙니다.";
        if(this.gameUsers[this.currentTurn] != userEntry) return "낼 차례가 아닙니다.";
        if(typeof cardIdx != "number") return "잘못된 카드입니다.";

        cardIdx = parseInt(cardIdx);
        if(cardIdx < 0 || cardIdx >= userEntry.deck.length) return "잘못된 카드입니다.";


        // 조커콜 처리
        const rawPlayingCard = userEntry.deck[cardIdx];
        const playingCard = this.decodeCard(rawPlayingCard);

        if(isJokerCall) {
            if(playingCard.num != 3) return "잚못된 조커콜입니다.";

            if(this.bidShape == 'clover') {
                if (playingCard.shape != 'spade') return "잘못된 조커콜입니다.";
            } else {
                if (playingCard.shape != 'clover') return "잘못된 조커콜입니다.";
            }
        }

        // Pop card!
        userEntry.deck.splice(cardIdx, 1);
        this.playedCards.push(rawPlayingCard);
        cmdout.emitGamePlayerCardPlay(this, this.currentTurn, rawPlayingCard);

        // maxCard & maxPlayer를 업데이트
        const cardScore = this.calculateCardScore(rawPlayingCard);
        if(this.trickWinner === null || this.maxCardScore < cardScore) {
            this.maxCardScore = cardScore;
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

    MightyRoom.prototype.calculateCardScore = function (card) {
        // 점수계산법
        // 0: 아무 점수도 없는 카드
        // 2~14 : 처음 낸 문양과 동일한 문양
        // 102~114 : 기루다 문양과 동일한 문양
        // 100: 첫번째 트릭에서 선플레이어가 낸 기루다
        // 200 : 조커
        // 300 : 마이티
        const firstCard = this.playedCards[0];
    };

    /**
     * 한번의 트릭이 끝났을 경우.
     */
    MightyRoom.prototype.onTrickEnd = function () {
        const winnerObtainedCards = this.obtainedCards[this.trickWinner];

        // 지금까지 모아진 카드중에 점수카드를 승자에게 준다.
        this.playedCards.forEach((card) => {
            if(card % 100 >= 10) winnerObtainedCards.push(card);
        });
        winnerObtainedCards.sort((a, b) => (a - b));

        // 게임 종료시
        if(this.currentTrick == 10) {
            this.onGameEnd();
            return;
        }

        this.startTurn = this.trickWinner;
        this.startNewTrick();
    };
};
