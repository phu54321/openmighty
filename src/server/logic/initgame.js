/**
 * Created by whyask37 on 2017. 2. 3..
 */

"use strict";

const _ = require('underscore');

const card = require('./card');
const Deck = require('./deck');

const cmdout = require('../io/cmdout');


/**
 * 랜덤으로 덱을 생성합니다.
 */
function createDeck() {
    const deck = [];
    for(let shape = 0 ; shape < 4 ; shape++) {
        for(let n = 2 ; n <= 14 ; n++) {
            deck.push(card.createCard(card.cardShapes[shape], n));
        }
    }
    deck.push(card.createCard('joker'));
    return new Deck(_.shuffle(deck));
}



module.exports = function (MightyRoom) {
    /**
     * 게임을 초기화합니다.
     */
    MightyRoom.prototype.initGame = function () {
        // Distribute deck
        const deck = createDeck();
        for (let player = 0; player < 5; player++) {
            const playerDeck = deck.slice(player * 10, (player + 1) * 10);
            this.gameUsers[player].deck = playerDeck.sort();
            cmdout.emitGamePlayerDeck(this, player);
        }

        return this.startBidding(deck.slice(50));
    };

    MightyRoom.prototype.endGame = function () {
        this.playing = false;
        this.users.forEach((user) => {
            user.socket.waitTime = 0;
        });
        delete this.gameUsers;
        delete this.gamelog;
    };
};
