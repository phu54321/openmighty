/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('lodash');
const cmdout = require('../io/cmdout');
const mutils = require('./mutils');

const bidShapes = mutils.bidShapes;

function isHigherBid(lastBidShape, lastBidCount, bidShape, bidCount) {
    if(bidShape == 'none') {
        if(lastBidShape == 'none' && lastBidCount >= bidCount) return false;
        else if(lastBidShape != 'none' && lastBidCount > bidCount) return false;
    }
    else if(lastBidCount >= bidCount) return false;

    return true;
}

function isValidBid(bidShape, bidCount) {
    if(!bidShape || !bidCount || typeof bidCount !== 'number') return false;
    if(bidShapes.indexOf(bidShape) == -1) return false;  // Invalid shape
    if(bidCount > 20 || bidCount < 12) return false; // Invalid count
    return true;
}

exports = module.exports = function (MightyRoom) {
    /**
     * Start bidding
     * @param remainingDeck
     * @returns {boolean}
     */

    MightyRoom.prototype.startBidding = function (remainingDeck) {
        // Remaining deck
        this.playState = 'bidding';
        this.canDealMiss = true;
        this.bidding = {
            passStatus: [false, false, false, false, false],
            currentBidder: 0,
            lastBidder: null,
            remainingDeck: remainingDeck
        };
        cmdout.emitGameBidRequest(this, 0);
        return null;
    };

    /**
     * 다음으로 추가 공약할 수 있는 사람을 찾습니다.
     * @returns {boolean} - 아무도 추가 공약을 할 수 없으면 false, 아니면 true
     */
    MightyRoom.prototype.findNextBidder = function () {
        if(!this.playing || this.playState != 'bidding') return false;
        const bidding = this.bidding;

        const initialBidder = bidding.currentBidder;
        let nextBidder = (bidding.currentBidder + 1) % 5;
        while(nextBidder != initialBidder && bidding.passStatus[nextBidder] === true) {
            nextBidder = (nextBidder + 1) % 5;
            if(nextBidder) this.canDealMiss = false;
        }

        // All passed or only initialBidder left
        if(nextBidder == initialBidder) return false;
        else if(bidding.lastBidder == nextBidder) return false;
        bidding.currentBidder = nextBidder;
        return true;
    };

    /**
     * 유저가 공약 거는걸 처리합니다
     */
    MightyRoom.prototype.onUserBid = function (userEntry, bidType) {
        if(!this.playing || this.playState != 'bidding') return "공약을 거는 중이 아닙니다.";
        const bidding = this.bidding;

        // 다른 사람이 공약을 걸려고 한다 - 패스
        if(userEntry !== this.gameUsers[bidding.currentBidder]) {
            return "주공이 아닙니다.";
        }

        const bidShape = bidType.shape;
        const bidCount = bidType.num;

        // 딜미스 처리
        if(bidShape == 'dealmiss') {
            if(!this.canDealMiss) return "딜 미스는 처음에만 할 수 있습니다.";

            const score = _.sum(_.map(userEntry.deck, mutils.cardDealMissScore));
            if(score <= 1) {  // 딜미스 요건 만족
                cmdout.emitGameAbort(this, '딜 미스입니다. (' + score + ')');
                this.endGame();
                return;
            }
        }

        // 패스 처리
        if(bidShape == 'pass') {
            bidding.passStatus[bidding.currentBidder] = true;
            cmdout.emitGamePlayerBidding(this, bidding.currentBidder, 'pass');
            passBidding(this);
            return null;
        }

        // 공약 처리
        const lastBidShape = bidding.lastBidShape || 'none';
        const lastBidCount = bidding.lastBidCount || 12;

        if(!isValidBid(bidShape, bidCount)) return "잘못된 공약입니다.";

        // 기존 공약보다 큰지 확인한다.
        if(!isHigherBid(lastBidShape, lastBidCount, bidShape, bidCount)) return "더 높은 공약을 내야합니다.";

        // 공약 업데이트
        bidding.lastBidder = bidding.currentBidder;
        bidding.lastBidCount = bidCount;
        bidding.lastBidShape = bidShape;
        cmdout.emitGamePlayerBidding(this, bidding.currentBidder, bidShape, bidCount);
        passBidding(this);
        return null;

        function passBidding(room) {
            if(
                bidding.lastBidCount == 20 ||  // 런 공약
                !room.findNextBidder()  // 마지막 공약
            ) {
                room.submitBidder();
            }
            else {
                cmdout.emitGameBidRequest(room, room.bidding.currentBidder);
            }
        }
    };


    /**
     * 공약 단계가 끝났을 때를 처리합니다. 공약이 한명만 남았거나 공약이 없습니다.
     */
    MightyRoom.prototype.submitBidder = function() {
        const bidding = this.bidding;

        if(bidding.lastBidder === null) {
            // 아무도 공약을 걸지 않았으므로 폐지
            this.emit('info', '아무도 공약을 걸지 않았으므로 게임을 종료합니다.');
            cmdout.emitGameAbort(this);
            this.endGame();
            return;
        }

        // 상태 변경
        this.president = bidding.lastBidder;
        this.bidCount = bidding.lastBidCount;
        this.bidShape = bidding.lastBidShape;
        this.remainingDeck = bidding.remainingDeck;
        delete this.bidding;

        // 카드를 받기 전에 공약을 변경할지 본다
        this.playState = 'bidchange1';
        cmdout.emitGameBidChange1Request(this);
    };

    MightyRoom.prototype.onBidChange1 = function(userEntry, newbid) {
        if(!this.playing || this.playState != 'bidchange1') return "공약변경단계가 아닙니다.";

        if(!newbid) return "잘못된 공약입니다.";

        // Preserve shape
        if(newbid.shape != 'pass') {
            const bidShape = newbid.shape;
            const bidCount = newbid.num;
            if(!isValidBid(bidShape, bidCount)) return "잘못된 공약입니다.";
            if(!isHigherBid(this.bidShape, this.bidCount, bidShape, bidCount)) return "더 높은 공약으로 변경해야합니다.";
            this.bidShape = bidShape;
            this.bidCount = bidCount;
        }
        cmdout.emitGameBidding(this);
        this.startFriendSelect(this.remainingDeck);
        return null;
    };
};

exports.isHigherBid = isHigherBid;
exports.isValidBid = isValidBid;

