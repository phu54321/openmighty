/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const cmdout = require('./../io/cmdout');
const bidding = require('./bidding');


module.exports = function (MightyRoom) {
    /**
     * 주공은 카드 3장을 버려야합니다. 이 discard3 단계를 시작합니다
     * @param remainingDeck
     */
    MightyRoom.prototype.startCardDiscard = function (remainingDeck) {
        const pUser = this.gameUsers[this.president];
        pUser.deck = pUser.deck.concat(remainingDeck);
        pUser.deck.sort((a, b) => (a - b));
        delete this.remainingDeck;

        cmdout.emitGamePlayerDeck(this, this.president);
        this.playState = 'discard3';
    };

    /**
     * 주공이 버릴 카드 3장을 선택했을 경우 해당 카드 3장을 버리고 친구 선택 단계로 들어갑니다.
     */
    MightyRoom.prototype.onCardDiscard = function (userEntry, cards) {
        // Authentication
        if(!this.playing || this.playState != 'discard3') return "카드를 버릴 단계가 아닙니다.";
        if(this.gameUsers[this.president] != userEntry) return "주공이 아닙니다.";

        // Index check
        if(cards.length != 3) return "카드를 3개 선택해야 합니다.";
        if(!_.every(cards, (card) => typeof card == 'number')) return "잘못된 카드 정보입니다.";

        cards = cards.sort((a, b) => a - b);
        // No duplicate index
        if(cards[0] == cards[1] || cards[1] == cards[2]) return "중복된 카드가 있습니다.";
        // Cards OOB
        if(cards[0] < 0 || cards[2] >= 13) return "잘못된 카드가 있습니다.";

        // Remove card from deck
        const pUser = this.gameUsers[this.president];
        pUser.deck.splice(cards[2], 1);
        pUser.deck.splice(cards[1], 1);
        pUser.deck.splice(cards[0], 1);

        // Rewrite deck
        cmdout.emitGameDiscardComplete(this);
        cmdout.emitGamePlayerDeck(this, this.president);

        this.playState = 'fselect';
        cmdout.emitFriendSelectRequest(this);
        return null;
    };

    /**
     * 주공이 친구를 선택합니다. 추가적으로 주공이 공약을 2차로 수정할 수 있습니다.
     * @param userEntry
     * @param msg
     */
    MightyRoom.prototype.onFriendSelectAndBidChange2 = function (userEntry, msg) {
        // Authentication
        if(!this.playing || this.playState != 'fselect') return "친구 선택 단계가 아닙니다.";
        if(this.gameUsers[this.president] != userEntry) return "주공이 아닙니다.";

        // 만약 공약 수정이 이루어졌다면 해당 공약도 체크합니다.
        if(msg.bidch2) {
            const bidCount = msg.bidch2.bidCount;
            const bidShape = msg.bidch2.bidShape;
            if(!bidding.isValidBid(bidShape, bidCount)) return "잘못된 공약입니다.";
            else if(this.bidCount + 2 > bidCount) return "2장 이상 더 공약해야 합니다.";  // 공약을 변경하려면 2장 이상 더 걸어야 한다
        }

        const applyBidChange2 = () => {
            if(msg.bidch2) {
                const bidCount = msg.bidch2.bidCount;
                const bidShape = msg.bidch2.bidShape;
                // 공약이 정당하단건 위에서 확인했습니다.
                this.bidCount = bidCount;
                this.bidShape = bidShape;
                cmdout.emitGameBidding(this);
            }
        };

        // Friend by card
        if(msg.ftype == 'card') {
            const card = msg.card;
            if(typeof card != 'number') return "잘못된 카드 설정입니다.";
            else if(!this.isValidCard(card)) return "잘못된 카드를 선택하셨습니다.";

            cmdout.emitFriendSelection(this, 'card', card);

            // Find friend
            let friend = null;
            for(let player = 0 ; player < 5 ; player++) {
                const pUserEntry = this.gameUsers[player];
                for(let i = 0 ; i < 10 ; i++) {
                    if(pUserEntry.deck[i] == card) {
                        friend = player;
                        break;
                    }
                }
                if(friend !== null) break;
            }

            this.friendType = 'card';
            this.friend = friend;
            applyBidChange2();
            this.startMainGame();
            return false;
        }
        else return "잘못된 프렌드 설정입니다.";
    };
};
