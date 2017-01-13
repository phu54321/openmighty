/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const cmdout = require('./../io/cmdout');

module.exports = function (MightyRoom) {
    MightyRoom.prototype.startCardDiscard = function () {
        if(!this.playing || this.playState != 'bidchange1') return false;

        const pUser = this.gameUsers[this.president];
        pUser.deck = pUser.deck.concat(this.remainingDeck);
        pUser.deck.sort((a, b) => (a - b));
        delete this.remainingDeck;

        cmdout.emitGamePlayerDeck(this, this.president);
        this.playState = 'discard3';
    };


    MightyRoom.prototype.onCardDiscard = function (userEntry, cards) {
        // Authentication
        if(!this.playing || this.playState != 'discard3') return false;
        if(this.gameUsers[this.president] != userEntry) return false;

        // Index check
        if(cards.length != 3) return false;
        if(!_.every(cards, (card) => typeof card == 'number')) return false;

        cards = cards.sort((a, b) => a - b);
        // No duplicate index
        if(cards[0] == cards[1] || cards[1] == cards[2]) return false;
        // Cards OOB
        if(cards[0] < 0 || cards[2] >= 13) return false;

        // Remove card from deck
        const pUser = this.gameUsers[this.president];
        pUser.deck = pUser.deck.splice(cards[2], 1);
        pUser.deck = pUser.deck.splice(cards[1], 1);
        pUser.deck = pUser.deck.splice(cards[0], 1);

        // Rewrite deck
        cmdout.emitGameDiscardComplete(this);
        cmdout.emitGamePlayerDeck(this, this.president);

        this.playState = 'fselect';
        cmdout.emitFriendSelectRequest(this);
        return true;
    };
};
