/**
 * Created by whyask37 on 2017. 1. 12..
 */

function MightyRoom() {
    this.users = [];
    this.playing = false;
}


// Logic relating room entry

/**
 * Get user index
 */
MightyRoom.prototype.getUserIndex = function (useridf) {
    for(let i = 0 ; i < this.users.length ; i++) {
        const userEntry = this.users[i];
        if(userEntry.useridf == useridf) return i;
    }
    return null;
};

/**
 * Check if room has user
 */
MightyRoom.prototype.hasUser = function (useridf) {
    return this.getUserIndex(useridf) !== null;
};


/**
 * Add user to room
 */
MightyRoom.prototype.addUser = function(socket, username, useridf, cb) {
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
    return this.users;
};


MightyRoom.prototype.isEmpty = function () {
    return this.users.length == 0;
};

/**
 * Remove user from room
 */
MightyRoom.prototype.removeUser = function (useridf, cb) {
    const index = this.getUserIndex(useridf);
    if(index === null) return cb(new Error('방에 존재하지 않는 인원입니다.'));
    this.users.splice(index, 1);
};


module.exports = MightyRoom;
