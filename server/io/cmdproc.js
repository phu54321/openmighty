/**
 * Created by whyask37 on 2017. 1. 12..
 */
"use strict";

let errmsg;

exports.start = function (socket, room, userEntry) {
    if(room.playing) return socket.emit('err', '이미 게임이 진행중입니다.');
    else if(userEntry.useridf != room.owner) {
        return socket.emit('err', '방장만 게임을 시작할 수 있습니다.');
    }

    userEntry.ready = true;
    if((errmsg = room.onStartGame()) !== null) {
        return socket.emit('err', errmsg);
    }
};


exports.bid = function (socket, room, userEntry, msg) {
    if ((errmsg = room.onUserBid(userEntry, msg)) !== null) {
        return socket.emit('err', errmsg);
    }
};


exports.bidch1 = function (socket, room, userEntry, msg) {
    if((errmsg = room.onBidChange1(userEntry, msg)) !== null) {
        return socket.emit('err', errmsg);
    }
};


exports.discard3 = function (socket, room, userEntry, msg) {
    if((errmsg = room.onCardDiscard(userEntry, msg.cards)) !== null) {
        return socket.emit('err', errmsg);
    }
};


exports.fsel = function (socket, room, userEntry, msg) {
    if((errmsg = room.onFriendSelectAndBidChange2(userEntry, msg)) !== null) {
        return socket.emit('err', errmsg);
    }
};

exports.cplay = function (socket, room, userEntry, msg) {
    if((errmsg = room.onCardPlay(userEntry, msg.cardIdx)) !== null) {
        return socket.emit('err', errmsg);
    }
};
