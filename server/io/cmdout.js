/**
 * Created by whyask37 on 2017. 1. 12..
 */

"use strict";

const _ = require('underscore');

exports.emitRoominfo = function (room) {
    const users = _.map(room.users, (user) => user.username);
    room.emit('cmd', {
        type: 'roomUsers',
        owner: room.getOwnerIndex(),
        users: users
    });
};


// Game related thing

exports.emitGamePlayers = function (room) {
    "use strict";
    const users = _.map(room.gameUsers, (user) => user.username);
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

exports.emitGamePlayerBidding = function (room, bidder, bidShape, bidCount) {
    const obj = {
        type: 'pbidinfo',
        bidder: bidder,
        shape: bidShape,
    };
    if(bidShape !== 'pass') obj.num = bidCount;
    room.emit('cmd', obj);
};

exports.emitGameBidding = function (room) {
    room.emit('cmd', {
        type: 'bidinfo',
        president: room.president,
        shape: room.gameBidShape,
        num: room.gameBidCount
    });
};

exports.emitGameDiscardComplete = function (room) {
    room.emit('cmd', {type: 'discard3end'});
};
