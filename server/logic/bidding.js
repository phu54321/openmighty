/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const cmdout = require('../io/cmdout');
const bidShapes = ['space', 'diamond', 'clover', 'heart', 'none'];

module.exports = function (MightyRoom) {
    "use strict";

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
        }

        // All passed or only initialBidder left
        if(nextBidder == initialBidder) return false;
        bidding.currentBidder = nextBidder;
        return true;
    };

    /**
     * 유저가 공약 거는걸 처리합니다
     */
    MightyRoom.prototype.onUserBid = function (userEntry, bidType) {
        if(!this.playing || this.playState != 'bidding') return false;
        const bidding = this.bidding;

        let bidShape = bidType.shape;
        const bidCount = bidType.num;

        // 다른 사람이 공약을 걸려고 한다 - 패스
        if(userEntry !== this.gameUsers[bidding.currentBidder]) {
            console.log('Invalid currentBidder');
            return false;
        }

        // 패스 처리
        if(bidShape == 'pass') {
            bidding.passStatus[bidding.currentBidder] = true;
            cmdout.emitGameBiddingInfo(this, bidding.currentBidder, 'pass');
            return passBidding(this);
        }

        // 공약 처리
        const lastBidShape = bidding.lastBidShape || 'none';
        const lastBidCount = bidding.lastBidCount || 12;

        if(!bidShape || !bidCount || typeof bidCount !== 'number') return false;
        if(bidShapes.indexOf(bidShape) == -1) return false;  // Invalid shape
        if(bidCount > 20 || bidCount < 12) return false; // Invalid count

        // 기존 공약보다 큰지 확인한다.
        if(bidShape == 'none') {
            if(lastBidShape == 'none' && lastBidCount >= bidCount) return false;
            else if(lastBidShape != 'none' && lastBidCount > bidCount) return false;
        }
        else if(lastBidCount >= bidCount) return false;

        // 공약 업데이트
        bidding.lastBidder = this.currentBidder;
        bidding.lastBidCount = bidCount;
        bidding.lastBidShape = bidShape;
        cmdout.emitGameBiddingInfo(this, bidding.currentBidder, bidShape, bidCount);
        return passBidding(this);

        function passBidding(room) {
            if(!room.findNextBidder()) return room.submitBidder();
            cmdout.emitGameBidRequest(room, room.bidding.currentBidder);
            return true;
        }
    };

    MightyRoom.prototype.submitBidder = function() {
        if(!this.playing || this.playState != 'bidding') return false;
        const bidding = this.bidding;

        if(bidding.lastBidder === null) {
            // 아무도 공약을 걸지 않았으므로 폐지
            this.emit('info', '아무도 공약을 걸지 않았으므로 게임을 종료합니다.');
            return this.endGame();
        }

        this.president = this.lastBidder;
        this.gameBidCount = this.lastBidCount;
        this.gameBidShape = this.lastBidShape;
        return true;
    };
};

