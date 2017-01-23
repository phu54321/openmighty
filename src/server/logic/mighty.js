/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const cmdout = require('./../io/cmdout');
const AISocket = require('./../io/randomBot');

const mutils = require('./mutils');
const cardShapes = require('./mutils');


function MightyRoom(roomID, owner) {
    "use strict";
    this.roomID = roomID;
    this.users = [];
    this.owner = owner;
    this.playing = false;
    this.playState = null;
    this.playTurn = 0;
}

/**
 * Broadcast socket message to room.
 * @param msgType
 * @param msg
 */
MightyRoom.prototype.emit = function (msgType, msg) {
    "use strict";
    const sentUsers = new Set();

    // 모든 사람 유저에게 emit.
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

    // timeout을 30초로 설정
    this.users.forEach((user) => {
        user.socket.waitTime = 30;
    });

    // Initialize game-related variables.
    // Add AI user if nessecary
    let playingUsers = this.users.slice(0);
    for(let i = 1 ; playingUsers.length < 5; i++) {
        const aiUserEntry = {
            username: 'Computer ' + i,
            useridf: this.roomID + '_AI' + i,
            emit: function (type, msg) {
                this.lastCommand = msg;
                this.socket.emit(type, msg);
            }
        };
        aiUserEntry.socket = new AISocket(this, aiUserEntry);
        playingUsers.push(aiUserEntry);
    }
    this.gameUsers = _.shuffle(playingUsers);
    this.emit('info', '게임을 시작합니다.');
    cmdout.emitGamePlayers(this);

    this.initGame();
    return null;
};


MightyRoom.prototype.endGame = function () {
    this.playing = false;
    this.users.forEach((user) => {
        user.socket.waitTime = 0;
    });
    delete this.gameUsers;
};


/**
 * 랜덤으로 덱을 생성합니다.
 */
function createDeck() {
    const deck = [];
    for(let shape = 0 ; shape < 4 ; shape++) {
        for(let n = 2 ; n <= 14 ; n++) {
            deck.push(mutils.createCard(mutils.cardShapes[shape], n));
        }
    }
    deck.push(mutils.createCard('joker'));
    return _.shuffle(deck);
}


/**
 * 게임을 초기화합니다.
 */
MightyRoom.prototype.initGame = function () {
    // Distribute deck
    const deck = createDeck();
    for(let player = 0 ; player < 5 ; player++) {
        const playerDeck = deck.slice(player * 10, (player + 1) * 10);
        this.gameUsers[player].deck = mutils.sortDeck(playerDeck);
        cmdout.emitGamePlayerDeck(this, player);
    }

    return this.startBidding(deck.slice(50));
};

MightyRoom.prototype.onAIStopRequest = function (userEntry) {
    if(!this.playing) return "플레이중이 아닙니다.";  // Cannot stop while playing

    if(userEntry.socket instanceof AISocket) {
        cmdout.emitGameAbort(this);
        this.endGame();
        return null;
    }
    else return "잘못된 명령입니다.";
};


//// 유틸리티 함수들


require('./bidding')(MightyRoom);
require('./roomsys')(MightyRoom);
require('./fselect')(MightyRoom);
require('./maingame')(MightyRoom);


module.exports = MightyRoom;
