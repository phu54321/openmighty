/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const cmdout = require('./../io/cmdout');
const bidding = require('./bidding');
const card = require('./card');
const Deck = require('./deck');

module.exports = function (MightyRoom) {
    /**
     * 주공은 카드 3장을 버려야합니다. 이 discard3 단계를 시작합니다
     * @param remainingDeck
     */
    MightyRoom.prototype.startFriendSelect = function (remainingDeck) {
        const pUser = this.gameUsers[this.president];
        pUser.deck = pUser.deck.concat(remainingDeck).sort();
        delete this.remainingDeck;

        cmdout.emitGamePlayerDeck(this, this.president);
        this.playState = 'fselect';
        cmdout.emitFriendSelectRequest(this);
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

        // 카드 버리기 - 인덱스 소트
        let cardIdxs = msg.discards;
        if(!Array.isArray(msg.discards)) return "버릴 카드를 선택하세요.";
        else if(cardIdxs.length != 3) return "버릴 카드를 3개 선택해야 합니다.";
        else if(!_.every(cardIdxs, (card) => typeof card == 'number')) return "잘못된 카드 정보입니다.";

        cardIdxs = _.map(cardIdxs, (c) => c | 0);  // 정수로 변환
        cardIdxs = cardIdxs.sort((a, b) => a - b);  // 순서대로 변환
        if(cardIdxs[0] < 0 || cardIdxs[2] >= 13) return "잘못된 카드가 있습니다.";
        if(cardIdxs[0] == cardIdxs[1] || cardIdxs[1] == cardIdxs[2]) return "중복된 카드가 있습니다.";

        // 만약 공약 수정이 이루어졌다면 해당 공약도 체크
        if(msg.bidch2) {
            const bidCount = msg.bidch2.num;
            const bidShape = msg.bidch2.shape;
            if(!bidding.isValidBid(bidShape, bidCount)) return "잘못된 공약입니다.";

            const bidStrength = bidding.getBidStrength(bidShape, bidCount);
            if(
                this.bidShape != bidShape &&
                bidStrength <= this.bidStrength + 1
            ) {
                return "2장 이상 더 공약해야 합니다.";  // 공약을 변경하려면 2장 이상 더 걸어야 한다
            }
            else if(this.bidShape == bidShape && this.bidCount > bidCount) {
                return "더 낮은 공약을 걸 수 없습니다.";
            }
        }

        // 프렌드를 카드로 선정
        if(msg.ftype == 'card') {
            if(!card.isValidCardParam(msg.shape, msg.num)) return "잘못된 카드 설정입니다.";
        }
        else if(msg.ftype == 'first');
        else if(msg.ftype == 'none');
        else if(msg.ftype == 'player') {
            if(typeof(msg.friend) != 'number') return "잘못된 프렌드 설정입니다.";
            msg.friend |= 0;
            if(!(0 <= msg.friend && msg.friend < 5)) return "잘못된 프렌드 설정입니다.";
            else if(msg.friend == this.president) {
                msg.ftype = 'none';
            }
        }
        else return "잘못된 프렌드 설정입니다.";


        ///////////////////////////////////////////////////////////////////////
        /// 실제 액션. 모든 예외사항이 위에서 처리되었으므로 여기선 유저 데이터를 믿는다.

        this.discardedCards = new Deck([]);

        // 카드를 제거하고 덱을 다시 쓴다.
        const pUser = this.gameUsers[this.president];
        pUser.deck.splice(cardIdxs[2], 1);
        pUser.deck.splice(cardIdxs[1], 1);
        pUser.deck.splice(cardIdxs[0], 1);
        cmdout.emitGamePlayerDeck(this, this.president);

        // 공약을 수정한다.
        if(msg.bidch2) {
            this.setBidding(msg.bidch2.shape, msg.bidch2.num);
        }

        // 프렌드를 선정한다.
        this.friend = null;

        if(msg.ftype == 'card') {
            const friendCard = card.createCard(msg.shape, msg.num);
            this.friendType = 'card';
            this.friendCard = friendCard;
            cmdout.emitFriendSelection(this, 'card', friendCard);
        }

        else if(msg.ftype == 'player') {
            this.friendType = 'player';
            this.friend = msg.friend;
            cmdout.emitFriendSelection(this, 'player', msg.friend);
        }

        else if(msg.ftype == 'first') {
            this.friendType = 'first';
            cmdout.emitFriendSelection(this, 'first');
        }

        else if(msg.ftype == 'none') {
            this.friendType = 'none';
            cmdout.emitFriendSelection(this, 'none');
        }

        this.startMainGame();
        return null;

    };
};
