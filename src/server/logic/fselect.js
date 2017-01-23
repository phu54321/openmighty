/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const cmdout = require('./../io/cmdout');
const bidding = require('./bidding');
const mutils = require('./mutils');

module.exports = function (MightyRoom) {
    /**
     * 주공은 카드 3장을 버려야합니다. 이 discard3 단계를 시작합니다
     * @param remainingDeck
     */
    MightyRoom.prototype.startFriendSelect = function (remainingDeck) {
        const pUser = this.gameUsers[this.president];
        pUser.deck = pUser.deck.concat(remainingDeck);
        mutils.sortDeck(pUser.deck);
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
        if(!msg.discards) return "버릴 카드를 선택하세요.";
        if(cardIdxs.length != 3) return "버릴 카드를 3개 선택해야 합니다.";
        if(!_.every(cardIdxs, (card) => typeof card == 'number')) return "잘못된 카드 정보입니다.";

        cardIdxs = _.map(cardIdxs.sort((a, b) => a - b), (card) => card | 0);
        if(cardIdxs[0] < 0 || cardIdxs[2] >= 13) return "잘못된 카드가 있습니다.";
        if(cardIdxs[0] == cardIdxs[1] || cardIdxs[1] == cardIdxs[2]) return "중복된 카드가 있습니다.";

        // 만약 공약 수정이 이루어졌다면 해당 공약도 체크
        if(msg.bidch2) {
            const bidCount = msg.bidch2.num;
            const bidShape = msg.bidch2.shape;
            if(!bidding.isValidBid(bidShape, bidCount)) return "잘못된 공약입니다.";
            else if(
                this.bidShape != bidShape &&
                !bidding.isHigherBid(this.bidShape, this.bidCount + 1, bidShape, bidCount)
            ) {
                return "2장 이상 더 공약해야 합니다.";  // 공약을 변경하려면 2장 이상 더 걸어야 한다
            }
            else if(this.bidShape == bidShape && this.bidCount > bidCount) {
                return "더 낮은 공약을 걸 수 없습니다.";
            }
        }

        // 프렌드를 카드로 선정
        if(msg.ftype == 'card') {
            if(!mutils.isValidCardParam(msg.shape, msg.num)) return "잘못된 카드 설정입니다.";
        }
        else if(msg.ftype == 'first');
        else if(msg.ftype == 'none');
        else return "잘못된 프렌드 설정입니다.";


        ///////////////////////////////////////////////////////////////////////
        /// 실제 액션. 모든 예외사항이 위에서 처리되었으므로 여기선 유저 데이터를 믿는다.

        this.discardedCards = [];

        // 카드를 제거하고 덱을 다시 쓴다.
        const pUser = this.gameUsers[this.president];
        this.discardedCards.push(pUser.deck.splice(cardIdxs[2], 1)[0]);
        this.discardedCards.push(pUser.deck.splice(cardIdxs[1], 1)[0]);
        this.discardedCards.push(pUser.deck.splice(cardIdxs[0], 1)[0]);
        cmdout.emitGamePlayerDeck(this, this.president);

        // 공약을 수정한다.
        if(msg.bidch2) {
            this.bidCount = msg.bidch2.num;;
            this.bidShape = msg.bidch2.shape;;
            cmdout.emitGameBidding(this);
        }

        // 프렌드를 선정한다.
        if(msg.ftype == 'card') {
            const card = mutils.createCard(msg.shape, msg.num);
            cmdout.emitFriendSelection(this, 'card', card);
            this.friendType = 'card';
            this.friendCard = card;
        }

        else if(msg.ftype == 'first') {
            this.friendType = 'first';
            cmdout.emitFriendSelection(this, 'first');
        }

        else if(msg.ftype == 'none') {
            this.friendType = 'none';
            cmdout.emitFriendSelection(this, 'none');
        }
        this.friend = null;

        this.startMainGame();
        return null;

    };
};
