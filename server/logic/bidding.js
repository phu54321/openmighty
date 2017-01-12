/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const cmdout = require('../io/cmdout');
const bidShapes = ['space', 'diamond', 'clover', 'heart', 'none'];

module.exports = function (MightyRoom) {
    "use strict";

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


    /**
     * Start bidding
     * @param remainingDeck
     * @returns {boolean}
     */

    MightyRoom.prototype.startBidding = function (remainingDeck) {
        // Remaining deck
        this.playState = 'bidding';
        this.bidding = {
            passStatus: [false, false, false, false, false],
            currentBidder: 0,
            lastBidder: null,
            remainingDeck: remainingDeck
        };
        cmdout.emitGameBidRequest(this, 0);
        return true;
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
            cmdout.emitGamePlayerBidding(this, bidding.currentBidder, 'pass');
            passBidding(this);
            return true;
        }

        // 공약 처리
        const lastBidShape = bidding.lastBidShape || 'none';
        const lastBidCount = bidding.lastBidCount || 12;

        if(!isValidBid(bidShape, bidCount)) return false;

        // 기존 공약보다 큰지 확인한다.
        if(!isHigherBid(lastBidShape, lastBidCount, bidShape, bidCount)) return true;

        // 공약 업데이트
        bidding.lastBidder = bidding.currentBidder;
        bidding.lastBidCount = bidCount;
        bidding.lastBidShape = bidShape;
        cmdout.emitGamePlayerBidding(this, bidding.currentBidder, bidShape, bidCount);
        passBidding(this);
        return true;

        function passBidding(room) {
            if(!room.findNextBidder()) {
                room.submitBidder();
                return true;
            }
            cmdout.emitGameBidRequest(room, room.bidding.currentBidder);
        }
    };

    MightyRoom.prototype.submitBidder = function() {
        if(!this.playing || this.playState != 'bidding') return false;
        const bidding = this.bidding;

        if(bidding.lastBidder === null) {
            // 아무도 공약을 걸지 않았으므로 폐지
            this.emit('info', '아무도 공약을 걸지 않았으므로 게임을 종료합니다.');
            delete this.bidding;
            this.endGame();
            return true;
        }

        // 상태 변경
        this.president = bidding.lastBidder;
        this.gameBidCount = bidding.lastBidCount;
        this.gameBidShape = bidding.lastBidShape;
        delete this.bidding;

        // 카드를 받기 전에 공약을 변경할지 본다
        this.playState = 'bidchange1';
        cmdout.emitGameBidChange1Request(this);
        return true;
    };

    MightyRoom.prototype.onBidChange1 = function(userEntry, newbid) {
        if(!this.playing || this.playState != 'bidchange1') return false;

        if(!newbid) return false;

        // Preserve shape
        if(newbid.shape == 'pass') {
            cmdout.emitGameBidding(this);
            this.startFriendSelect();
            return true;
        }
        else {
            const bidShape = newbid.shape;
            const bidCount = newbid.num;
            if(!isValidBid(bidShape, bidCount)) return false;

            // 노기루다 -> 기루다 전환시에 1개 이상 공약을 더 걸어야함
            if(this.gameBidShape == 'none' && bidShape != 'none') {
                if(bidCount < this.gameBidCount + 1) return false;
            }

            // 그 외에는 2개 이상 공약을 더 걸어야함
            else {
                if(bidCount < this.gameBidCount + 2) return false;
            }
        }
    }
};

