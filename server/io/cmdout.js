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
        user.emit('cmd', {
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
    user.emit('cmd', {
        type: 'deck',
        deck: user.deck
    });
};

////////////////////////////////////////
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
    user.emit('cmd', {type: 'bidrq'});
};

exports.emitGameBidding = function (room) {
    room.emit('cmd', {
        type: 'bidinfo',
        president: room.president,
        shape: room.bidShape,
        num: room.bidCount
    });
};

exports.emitGameBidChange1Request = function (room) {
    const president = room.president;
    room.gameUsers[president].emit('cmd', {type: 'bidch1rq'});
};


exports.emitGameDiscardComplete = function (room) {
    room.emit('cmd', {type: 'discard3end'});
};


exports.emitFriendSelectRequest = function (room) {
    const president = room.president;
    room.gameUsers[president].emit('cmd', {type: 'fselrq'});
};

exports.emitFriendSelection = function (room, friendType, arg) {
    room.emit('cmd', {
        type: 'fsel',
        friendType: friendType,
        arg: arg
    });
};


////////////////////////////////////////
// 메인 게임

exports.emitGameCardPlayRequest = function (room) {
    const currentTurn = room.currentTurn;
    room.gameUsers[currentTurn].emit('cmd', {
        type: 'playrq',
        shaperq: room.playedCards.length > 0 ? room.playedCards[0].shape : undefined,
        jcall: room.jokerCalled ? true : undefined
    });
};

exports.emitGamePlayerCardPlay = function (room, player, card, jcall) {
    room.emit('cmd', {
        type: 'pcplay',
        player: player,
        card: card,
        jcall: jcall
    });
};

exports.emitGameTrickEnd = function (room) {
    room.emit('cmd', {type: 'tend'});
};

exports.emitGameEnd = function (room, oppObtainedCardCount) {
    room.emit('cmd', {
        type: 'gend',
        oppcc: oppObtainedCardCount
    });
};
