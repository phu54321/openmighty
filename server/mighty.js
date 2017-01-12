/**
 * Created by whyask37 on 2017. 1. 12..
 */

const _ = require('underscore');

function MightyRoom(roomID, owner) {
    "use strict";
    this.roomID = roomID;
    this.users = [];
    this.owner = owner;
    this.playing = false;
    this.playTurn = 0;

    // Game-related
    this.playingUsers = null;
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
// Game start related

/**
 * Check if all users are ready
 * @returns {boolean}
 */

MightyRoom.prototype.isAllPlayerReady = function () {
    "use strict";
    return _.every(this.users, (user) => user.ready);
};

MightyRoom.prototype.startGame = function () {
    "use strict";
    if(this.playing) return false;
    else if(!this.isAllPlayerReady()) return false;

    this.playing = true;

    // Initialize game-related variables.
    // Add AI user if nessecary
    let playingUsers = this.users.slice(0);
    for(let i = 1 ; i <= 5 - playingUsers.length ; i++) {
        const aiUser = {
            socket: null,
            username: 'Computer ' + i,
            useridf: this.roomID + '_AI' + i
        };
        playingUsers.push(aiUser);
    }
    this.playingUsers = _.shuffle(playingUsers);

    _.map(this.playingUsers, (user) => {
        user.score = 20;
    });

    this.playTurn = 0;
    return true;
};





module.exports = MightyRoom;
