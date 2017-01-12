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

exports.emitGameBidRequest = function (room, userIdx) {
    const user = room.listGameUsers()[userIdx];
    user.socket.emit('cmd', {type: 'bidrq'});
};

exports.emitGameBiddingInfo = function (room, bidder, bidShape, bidCount) {
    if(bidShape == 'pass') {
        room.emit('cmd', {
            type: 'bidinfo',
            bidder: bidder,
            shape: bidShape,
        });
    }
    else {
        room.emit('cmd', {
            type: 'bidinfo',
            bidder: bidder,
            shape: bidShape,
            num: bidCount
        });
    }
};
