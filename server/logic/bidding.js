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
        const initialBidder = this.currentBidder;
        let nextBidder = (this.currentBidder + 1) % 5;
        while(nextBidder != initialBidder && this.passStatus[nextBidder] === true) {
            nextBidder = (nextBidder + 1) % 5;
        }

        // All passed or only initialBidder left
        if(nextBidder == initialBidder) return false;
        this.currentBidder = nextBidder;
        return true;
    };

    /**
     * 유저가 공약 거는걸 처리합니다
     */
    MightyRoom.prototype.onUserBid = function (userEntry, bidType) {
        if(!this.playing) return false;

        let bidShape = bidType.shape;
        const bidCount = bidType.num;

        // 다른 사람이 공약을 걸려고 한다 - 패스
        if(userEntry !== this.gameUsers[this.currentBidder]) {
            console.log('Invalid currentBidder');
            return false;
        }

        // 패스 처리
        if(bidShape == 'pass') {
            this.passStatus[this.currentBidder] = true;
            cmdout.emitGameBiddingInfo(this, this.currentBidder, 'pass');
            return passBidding(this);
        }

        // 공약 처리
        const lastBidShape = this.lastBidShape || 'none';
        const lastBidCount = this.lastBidCount || 12;

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
        this.lastBidder = this.currentBidder;
        this.lastBidCount = bidCount;
        this.lastBidShape = bidShape;
        cmdout.emitGameBiddingInfo(this, this.currentBidder, bidShape, bidCount);
        return passBidding(this);

        function passBidding(room) {
            if(!room.findNextBidder()) return room.submitBidder();
            cmdout.emitGameBidRequest(room, room.currentBidder);
            return true;
        }
    };

    MightyRoom.prototype.submitBidder = function() {
        this.president = this.lastBidder;
        this.gameBidCount = this.lastBidCount;
        this.gameBidShape = this.lastBidShape;
        return true;
    };
};

