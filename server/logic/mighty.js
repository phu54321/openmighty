/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
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
    const sentUsers = new Set();

    // 모든 사람 유저에게 emit.
    _.map(this.users, (user) => {
        if(!sentUsers.has(user)) {
            user.socket.emit(msgType, msg);
            sentUsers.add(user);
        }
    });


    // gameUser에게도 emit. ex) AI
    _.map(this.gameUsers, (user) => {
        if(!sentUsers.has(user)) {
            user.socket.emit(msgType, msg);
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


const cardShapes = ['spade', 'diamond', 'clover', 'heart', 'joker'];

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
 * 게임 유저들을 봅니다.
 * @returns {*}
 */
MightyRoom.prototype.listGameUsers = function () {
    "use strict";
    if(!this.playing) return null;
    return this.gameUsers;
};


/**
 * 랜덤으로 덱을 생성합니다.
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
 * 게임을 초기화합니다.
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

/**
 * 카드가 올바른 카드인지 체크합니다
 */
MightyRoom.prototype.isValidCard = function (card) {
    if(0 <= card && card < 400) {  // 일반 카드
        const cardNum = card % 100;  // 카드의 숫자
        return 2 <= cardNum && cardNum <= 14;
    }
    else return card == 400;  // 조커
}


require('./bidding')(MightyRoom);
require('./roomsys')(MightyRoom);
require('./fselect')(MightyRoom);


module.exports = MightyRoom;
