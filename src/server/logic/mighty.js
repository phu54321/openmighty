/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const cmdout = require('../io/cmdout');
const cmdcmp = require('../cmdcmp/cmdcmp');

const AISocket = require('../io/aiBot');
const gamelog = require('../../models/gamelog');

function MightyRoom(roomID, owner) {
    "use strict";
    this.roomID = roomID;
    this.users = [];
    this.owner = owner;
    this.playing = false;
    this.playState = null;
}

/**
 * Broadcast socket message to room.
 * @param msgType
 * @param msg
 */
MightyRoom.prototype.emit = function (msgType, msg) {
    msg = cmdcmp.compressCommand(msg);

    // 모든 사람 유저에게 emit.
    const sentUsers = new Set();
    _.map(this.users, (user) => {
        if(!sentUsers.has(user)) {
            user.emit(msgType, msg);
            sentUsers.add(user);
        }
    });

    // gameUser에게도 emit. ex) AI
    _.map(this.gameUsers, (user) => {
        if(!sentUsers.has(user)) {
            user.emit(msgType, msg);
            sentUsers.add(user);
        }
    });

    // 로그에도 emit
    if(msgType == 'cmd' && this.gamelog) {
        this.gamelog.log(msg);
    }
};




///////////////////////////////////////////////////////////////

/*
    Game status

    -1 : 공약하기
    -2 : 모두 공약 포기
    -3 : 플레이어가 나오고
 */



// Game start related
MightyRoom.prototype.onStartGame = function () {
    "use strict";
    if(this.playing) return "이미 플레이중입니다.";

    this.playing = true;

    // gameLog에 필요한 gameUsers만 일단
    let playingUsers = this.users.slice(0);
    for(let i = 1 ; playingUsers.length < 5; i++) {
        const aiUserEntry = {
            username: 'Computer ' + i,
            useridf: '%AI' + i,
            ai: true,
            emit: function (type, msg) {
                this.lastCommand = msg;
                this.socket.emit(type, msg);
            }
        };
        aiUserEntry.socket = new AISocket(this, aiUserEntry);
        playingUsers.push(aiUserEntry);
    }
    this.gameUsers = _.shuffle(playingUsers);

    gamelog.createGamelog(this, (err, gamelog) => {
        if(err) {
            global.logger.error(err);
            this.emit('err', "게임을 시작할 수 없습니다.");
            delete this.gameUsers;
            return;
        }

        this.gamelog = gamelog;

        global.logger.info(`Starting game from room #${this.roomID}`);

        // timeout을 30초로 설정
        this.users.forEach((user) => {
            user.socket.waitTime = 30;
            user.ai = false;
        });

        this.emit('info', '게임을 시작합니다.');
        cmdout.emitGamePlayers(this);

        this.initGame();
    });
    return null;
};

MightyRoom.prototype.onAIStopRequest = function (userEntry) {
    if (!this.playing) return "플레이중이 아닙니다.";  // Cannot stop while playing

    if (userEntry.socket instanceof AISocket) {
        cmdout.emitGameAbort(this);
        this.endGame();
        return null;
    }
    else return "잘못된 명령입니다.";
};



//// 유틸리티 함수들


require('./initgame')(MightyRoom);
require('./bidding')(MightyRoom);
require('./roomsys')(MightyRoom);
require('./friendsel')(MightyRoom);
require('./maingame')(MightyRoom);


module.exports = MightyRoom;
