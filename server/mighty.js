/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const sprintf = require('sprintf-js').sprintf;
const cmdout = require('./cmdout');
const AISocket = require('./aisocket');


function MightyRoom(roomID, owner) {
    "use strict";
    this.roomID = roomID;
    this.users = [];
    this.owner = owner;
    this.playing = false;
    this.playTurn = 0;
}

/**
 * Broadcast socket message to room.
 * @param msgType
 * @param msg
 */
MightyRoom.prototype.emit = function (msgType, msg) {
    "use strict";
    _.map(this.users, (user) => {
        user.socket.emit(msgType, msg);
    });
};


///////////////////////////////////////////////////////////////
// Room related


/**
 * Get user index
 */
MightyRoom.prototype.getUserIndex = function (useridf) {
    "use strict";
    for(let i = 0 ; i < this.users.length ; i++) {
        const userEntry = this.users[i];
        if(userEntry.useridf == useridf) return i;
    }
    return null;
};

/**
 * Get room owner index
 */
MightyRoom.prototype.getOwnerIndex = function () {
    "use strict";
    return this.getUserIndex(this.owner);
};

/**
 * Check if room has user
 */
MightyRoom.prototype.hasUser = function (useridf) {
    "use strict";
    return this.getUserIndex(useridf) !== null;
};


/**
 * Add user to room
 */
MightyRoom.prototype.addUser = function(socket, username, useridf, cb) {
    "use strict";

    // No re-entering
    if(this.hasUser(useridf)) {
        return cb(new Error('이미 들어간 방에 재입장할 수 없습니다.'));
    }

    // Cannot add player to already-playing game
    else if(this.playing) {
        return cb(new Error('이미 게임중인 방입니다.'));
    }

    // Cannot add player to room already having 5 players
    else if(this.users.length == 5) {
        return cb(new Error('방이 꽉 찼습니다.'));
    }

    // Add player to user list
    const userEntry = {
        socket: socket,
        username: username,
        useridf: useridf
    };
    this.users.push(userEntry);
    cb(null, userEntry);
};



/**
 * Get user list
 * @returns {*}
 */
MightyRoom.prototype.listUsers = function () {
    "use strict";
    return this.users;
};


/**
 * Check if room is empty - Empty room should be garbage-collected.
 * @returns {boolean}
 */
MightyRoom.prototype.isEmpty = function () {
    "use strict";
    return this.users.length === 0;
};

/**
 * Remove user from room
 */
MightyRoom.prototype.removeUser = function (useridf, cb) {
    "use strict";
    const index = this.getUserIndex(useridf);
    if(index === null) return cb(new Error('방에 존재하지 않는 인원입니다.'));
    this.users.splice(index, 1);

    if(useridf == this.owner && this.users.length > 0) {
        const newOwnerEntry = this.users[Math.floor(Math.random() * this.users.length)];
        this.owner = newOwnerEntry.useridf;
    }
    return cb(null);
};



///////////////////////////////////////////////////////////////

/*
    Game status

    -1 : 공약하기
    -2 : 모두 공약 포기
    -3 : 플레이어가 나오고
 */


const cardShapes = ['space', 'diamond', 'clover', 'heart', 'joker'];
const bidShapes = ['space', 'diamond', 'clover', 'heart', 'none'];

// Game start related
MightyRoom.prototype.startGame = function () {
    "use strict";
    if(this.playing) return false;

    this.playing = true;

    // Initialize game-related variables.
    // Add AI user if nessecary
    let playingUsers = this.users.slice(0);
    for(let i = 1 ; playingUsers.length < 5; i++) {
        const aiUserEntry = {
            username: 'Computer ' + i,
            useridf: this.roomID + '_AI' + i
        };
        aiUserEntry.socket = new AISocket(this, aiUserEntry);
        playingUsers.push(aiUserEntry);
    }
    this.gameUsers = _.shuffle(playingUsers);
    this.emit('info', '게임을 시작합니다.');
    cmdout.emitGamePlayers(this);

    this.initGame();
    return true;
};

MightyRoom.prototype.endGame = function () {
    if(!this.playing) return false;
    this.playing = false;
    delete this.gameUsers;
};


/**
 * List in-game users
 * @returns {*}
 */
MightyRoom.prototype.listGameUsers = function () {
    "use strict";
    if(!this.playing) return null;
    return this.gameUsers;
};


/**
 * Create deck
 * @returns {Array}
 */
function createDeck() {
    const deck = [];
    for(let shape = 0 ; shape < 4 ; shape++) {
        for(let n = 2 ; n <= 14 ; n++) {
            deck.push(shape * 100 + n);
        }
    }
    deck.push(400);
    return _.shuffle(deck);
}

/**
 * Initialize created game
 */
MightyRoom.prototype.initGame = function () {
    if(!this.playing) return false;

    this.playTurn = 0;

    const deck = createDeck();

    // Distribute deck
    for(let player = 0 ; player < 5 ; player++) {
        const playerDeck = deck.slice(player * 10, (player + 1) * 10);
        this.gameUsers[player].deck = playerDeck.sort((a, b) => a - b);
        cmdout.emitGamePlayerDeck(this, player);
    }
    // Remaining deck
    this.remainingDeck = deck.slice(50);
    this.passStatus = [false, false, false, false, false];
    this.currentBidder = 0;
    this.lastBidder = null;
    cmdout.emitGameBidRequest(this, 0);

    return true;
};


/**
 * Find next bidder
 * @returns {boolean} - Is there any other remaining player to bid?
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
 * 유저가 공약을 걸었을 때.
 */
MightyRoom.prototype.onUserBid = function (userEntry, bidType) {
    if(!this.playing) return false;

    let bidShape = bidType.shape;
    const bidCount = bidType.num;

    // 다른 사람이 공약을 걸려고 한다 - 패스
    if(userEntry !== this.gameUsers[this.currentBidder]) {
        return false;
    }

    // 패스 처리
    if(bidShape == 'pass') {
        this.passStatus[this.currentBidder] = true;
        if(!this.findNextBidder()) return this.submitBidder();
        cmdout.emitGameBidRequest(this, this.currentBidder);
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
    cmdout.emitBiddingInfo(this);
    return passBidding(this);

    function passBidding(room) {
        if(!room.findNextBidder()) return room.submitBidder();
        cmdout.emitGameBidRequest(room, room.currentBidder);
        return true;
    }
};


module.exports = MightyRoom;
