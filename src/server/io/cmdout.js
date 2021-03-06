/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');
const AISocket = require('./aiBot');

// Room related

exports.emitRoomUsers = function (room, user) {
    const usersInfo = _.map(
        room.users,
        (user) => {
            return {
                useridf: user.useridf,
                username: user.username,
                rating: user.rating
            };
        });

    let users;
    if(user) users = [user];
    else users = room.users;
    users.forEach(user => {
        user.emit('cmd', {
            type: 'rusers',
            owner: room.getOwnerIndex(),
            youridf: user.useridf,
            users: usersInfo
        });
    });
};


exports.emitRoomJoin = function (room, newUser) {
    _.map(room.users, (user) => {
        if(user == newUser) return;  // don't send message to same user
        user.emit('cmd', {
            type: 'rjoin',
            username: newUser.username,
            useridf: newUser.useridf,
            rating: newUser.rating,
        });
    });
};

exports.emitRoomLeft = function (room, useridf) {
    room.emit('cmd', {
        type: 'rleft',
        useridf: useridf,
        owner: room.getOwnerIndex()
    });
};



// Game Initialization

exports.emitGamePlayers = function (room) {
    "use strict";
    const users = _.map(
        room.gameUsers,
        (user) => {
            return {
                username: user.username,
                useridf: user.useridf,
                rating: user.rating
            };
        });
    room.emit('cmd', {
        type: 'gusers',
        users: users,
    });
};


exports.emitGamePlayerDeck = function (room, userIdx) {
    "use strict";
    const user = room.gameUsers[userIdx];
    user.emit('cmd', {
        type: 'deck',
        deck: user.deck
    });
};


////////////////////////////////////////
// Bidding & Friend selection


exports.emitGamePlayerBidding = function (room, bidder, bidShape, bidCount) {
    const obj = {
        type: 'pbinfo',
        bidder: bidder,
        bidShape: bidShape,
    };
    if(bidShape !== 'pass') obj.bidCount = bidCount;
    room.emit('cmd', obj);
};

exports.emitGameBidRequest = function (room, userIdx) {
    const user = room.gameUsers[userIdx];
    user.emit('cmd', {
        type: 'bidrq'
    });
};

exports.emitGameBidChange1Request = function (room) {
    const president = room.president;
    room.gameUsers[president].emit('cmd', {
        type: 'bc1rq'
    });
};

exports.emitGameBidding = function (room) {
    room.emit('cmd', {
        type: 'binfo',
        president: room.president,
        shape: room.bidShape,
        num: room.bidCount
    });
};


exports.emitFriendSelectRequest = function (room) {
    const president = room.president;
    room.gameUsers[president].emit('cmd', {
        type: 'fsrq'
    });
};

exports.emitFriendSelection = function (room, friendType, args) {
    room.emit('cmd', {
        type: 'fs',
        ftype: friendType,
        args: args
    });
};


////////////////////////////////////////
// 메인 게임

exports.emitGameCardPlayRequest = function (room) {
    const currentTurn = room.currentTurn;
    room.gameUsers[currentTurn].emit('cmd', {
        type: 'cprq',
        shaperq: room.shapeRequest || undefined,
        jcall: room.jokerCalled ? true : undefined
    });
};


exports.emitJokerRequest = function (room) {
    room.emit('cmd', {
        type: 'jrq',
        shaperq: room.shapeRequest || undefined,
    });
};


exports.emitGamePlayerCardPlay = function (room, player, card, jcall) {
    room.emit('cmd', {
        type: 'pcp',
        player: player,
        card: card,
        jcall: jcall
    });
};

exports.emitGameTrickEnd = function (room, winner) {
    room.emit('cmd', {
        type: 'tend',
        winner: winner
    });
};

exports.emitGameEnd = function (room, oppObtainedCardCount, scoreTable, setUser) {
    const obj = {
        type: 'gend',
        scores: scoreTable,
        oppcc: oppObtainedCardCount
    };
    if(setUser !== undefined) {
        obj.setUser = setUser;
        obj.setDeck = room.gameUsers[setUser].deck;
    }
    room.emit('cmd', obj);
};

////

exports.emitGameAbort = function (room, msg) {
    const obj = {type: 'gabort'};
    if(msg) obj.msg = msg;
    room.emit('cmd', obj);
};
