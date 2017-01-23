/**
 * Created by whyask37 on 2017. 1. 12..
 */
"use strict";

let errmsg;

// Start
exports.start = function (socket, room, userEntry) {
    if(room.playing) return socket.emit('err', '이미 게임이 진행중입니다.');
    else if(userEntry.useridf != room.owner) {
        return socket.emit('err', '방장만 게임을 시작할 수 있습니다.');
    }

    if((errmsg = room.onStartGame()) !== null) {
        return socket.emit('err', errmsg);
    }
};

// Bidding
exports.bid = function (socket, room, userEntry, msg) {
    if ((errmsg = room.onUserBid(userEntry, msg)) !== null) {
        return socket.emit('err', errmsg);
    }
};

// Bid change 1
exports.bc1 = function (socket, room, userEntry, msg) {
    if((errmsg = room.onBidChange1(userEntry, msg)) !== null) {
        return socket.emit('err', errmsg);
    }
};


// Discard3
exports.d3 = function (socket, room, userEntry, msg) {
    if((errmsg = room.onCardDiscard(userEntry, msg.cards)) !== null) {
        return socket.emit('err', errmsg);
    }
};

// Friend selection
exports.fs = function (socket, room, userEntry, msg) {
    if((errmsg = room.onFriendSelectAndBidChange2(userEntry, msg)) !== null) {
        return socket.emit('err', errmsg);
    }
};

// Card play
exports.cp = function (socket, room, userEntry, msg) {
    if((errmsg = room.onCardPlay(userEntry, msg)) !== null) {
        return socket.emit('err', errmsg);
    }
};

// Abort
exports.abort = function (socket, room, userEntry) {
    if((errmsg = room.onAIStopRequest(userEntry)) !== null) {
        return socket.emit('err', errmsg);
    }
};
