/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');

// Room related

exports.emitRoomUsers = function (room, user) {
    const users = _.map(
        room.users,
        (user) => {
            return {useridf: user.useridf, username: user.username};
        });
    user.emit('cmd', {
        type: 'rusers',
        owner: room.getOwnerIndex(),
        youridf: user.useridf,
        users: users
    });
};

exports.emitRoomJoin = function (room, newUser) {
    _.map(room.users, (user) => {
        if(user == newUser) return;  // don't send message to same user
        user.emit('cmd', {
            type: 'rjoin',
            username: newUser.username,
            useridf: newUser.useridf
        });
    });
};

exports.emitRoomLeft = function (room, useridf) {
    room.emit('cmd', {
        type: 'rleft',
        useridf: useridf,
        owner: room.owner
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
                useridf: user.useridf
            };
        });
    room.emit('cmd', {
        type: 'gusers',
        users: users
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

exports.emitGameDiscardRequest = function (room) {
    const president = room.president;
    room.gameUsers[president].emit('cmd', {
        type: 'd3rq'
    });
};

exports.emitGameDiscardComplete = function (room) {
    room.emit('cmd', {
        type: 'd3end'
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
        friendType: friendType,
        args: args
    });
};


////////////////////////////////////////
// 메인 게임

exports.emitGameCardPlayRequest = function (room) {
    const currentTurn = room.currentTurn;
    room.gameUsers[currentTurn].emit('cmd', {
        type: 'cprq',
        shaperq: room.playedCards.length > 0 ? room.playedCards[0].shape : undefined,
        jcall: room.jokerCalled ? true : undefined
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

exports.emitGameTrickEnd = function (room) {
    room.emit('cmd', {
        type: 'tend'
    });
};

exports.emitGameEnd = function (room, oppObtainedCardCount) {
    room.emit('cmd', {
        type: 'gend',
        oppcc: oppObtainedCardCount
    });
};

////

exports.emitGameAbort = function (room, msg) {
    const obj = {type: 'gabort'};
    if(msg) obj.msg = msg;
    room.emit('cmd', obj);
};
