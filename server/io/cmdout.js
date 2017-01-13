/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');

// Room related

exports.emitRoomUsers = function (room) {
    const users = _.map(room.users, (user) => user.useridf);
    room.emit('cmd', {
        type: 'roomUsers',
        owner: room.getOwnerIndex(),
        users: users
    });
};

exports.emitRoomJoin = function (room, newUser) {
    _.map(room.users, (user) => {
        if(user == newUser) return;  // don't send message to same user
        user.socket.emit('cmd', {
            type: 'roomJoin',
            username: newUser.username,
            useridf: newUser.useridf
        });
    });
};

exports.emitRoomLeft = function (room, useridf) {
    room.emit('cmd', {
        type: 'roomLeft',
        useridf: useridf
    });
};



// Game Initialization

exports.emitGamePlayers = function (room) {
    "use strict";
    const users = _.map(room.gameUsers, (user) => user.useridf);
    room.emit('cmd', {
        type: 'gameUsers',
        users: users
    });
};


exports.emitGamePlayerDeck = function (room, userIdx) {
    "use strict";
    const user = room.gameUsers[userIdx];
    user.socket.emit('cmd', {
        type: 'myDeck',
        data: user.deck
    });
};

// Bidding & Friend selection

exports.emitGamePlayerBidding = function (room, bidder, bidShape, bidCount) {
    const obj = {
        type: 'pbidinfo',
        bidder: bidder,
        shape: bidShape,
    };
    if(bidShape !== 'pass') obj.num = bidCount;
    room.emit('cmd', obj);
};

exports.emitGameBidRequest = function (room, userIdx) {
    const user = room.gameUsers[userIdx];
    user.socket.emit('cmd', {type: 'bidrq'});
};

exports.emitGameBidding = function (room) {
    room.emit('cmd', {
        type: 'bidinfo',
        president: room.president,
        shape: room.gameBidShape,
        num: room.gameBidCount
    });
};

exports.emitGameBidChange1Request = function (room) {
    const president = room.president;
    room.gameUsers[president].socket.emit('cmd', {type: 'bidch1rq'});
};


exports.emitGameDiscardComplete = function (room) {
    room.emit('cmd', {type: 'discard3end'});
};


exports.emitFriendSelectRequest = function (room) {
    const president = room.president;
    room.gameUsers[president].socket.emit('cmd', {type: 'fselrq'});
};