/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const sprintf = require('sprintf-js').sprintf;
const cmdout = require('./../io/cmdout');
const AISocket = require('./../io/aisocket');


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
    _.map(this.users, (user) => {
        user.socket.emit(msgType, msg);
    });
};




///////////////////////////////////////////////////////////////

/*
    Game status

    -1 : 공약하기
    -2 : 모두 공약 포기
    -3 : 플레이어가 나오고
 */


const cardShapes = ['space', 'diamond', 'clover', 'heart', 'joker'];

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

    // Distribute deck
    const deck = createDeck();
    for(let player = 0 ; player < 5 ; player++) {
        const playerDeck = deck.slice(player * 10, (player + 1) * 10);
        this.gameUsers[player].deck = playerDeck.sort((a, b) => a - b);
        cmdout.emitGamePlayerDeck(this, player);
    }

    return this.startBidding(deck.slice(50));
};

require('./bidding')(MightyRoom);
require('./roomsys')(MightyRoom);
require('./fselect')(MightyRoom);


module.exports = MightyRoom;
