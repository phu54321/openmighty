/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const cmdcmp = require('../cmdcmp/cmdcmp');
const AISocket = require('../io/randomBot');
const _ = require('underscore');

module.exports = function (MightyRoom) {
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

        // Cannot add player to already-playing game
        if(this.playing) {
            return cb(new Error('이미 게임중인 방입니다.'));
        }

        // No re-entering
        else if(this.hasUser(useridf)) {
            return cb(new Error('이미 들어간 방에 재입장할 수 없습니다.'));
        }

        // Cannot add player to room already having 5 players
        else if(this.users.length == 5) {
            return cb(new Error('방이 꽉 찼습니다.'));
        }

        // Add player to user list
        const userEntry = {
            socket: socket,
            username: username,
            useridf: useridf,
            emit: function (type, obj) {
                if(type == 'cmd') obj = cmdcmp.compressCommand(obj);
                this.socket.emit(type, obj);
                if(type == 'cmd') this.lastCommand = obj;
            }
        };
        this.users.push(userEntry);
        cb(null, userEntry);
    };


    /**
     * Check if room is empty - Empty room should be garbage-collected.
     * @returns {boolean}
     */
    MightyRoom.prototype.hasNoUser = function () {
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
        const userEntry = this.users[index];
        this.users.splice(index, 1);

        // 방장 승계
        if(useridf == this.owner && this.users.length > 0) {
            const newOwnerEntry = this.users[Math.floor(Math.random() * this.users.length)];
            this.owner = newOwnerEntry.useridf;
        }

        // 플레이중인 유저라면 AISocket으로 대체
        if(this.playing) {
            userEntry.socket = new AISocket(this, userEntry);
            userEntry.socket.deck = userEntry.deck;
            if(userEntry.lastCommand) {
                const lastCommand = _.clone(userEntry.lastCommand);
                lastCommand.jcall = this.jokerCalled;
                userEntry.emit('cmd', lastCommand);
            }
        }

        return cb(null);
    };
};
