/**
 * Created by whyask37 on 2017. 1. 12..
 */
"use strict";

exports.start = function (socket, room, userEntry) {
    if(room.playing) return socket.emit('err', '이미 게임이 진행중입니다.');
    else if(userEntry.useridf != room.owner) {
        return socket.emit('err', '방장만 게임을 시작할 수 있습니다.');
    }

    userEntry.ready = true;
    if(!room.startGame()) return socket.emit('err', '모든 플레이어가 레디했지만 게임 시작을 하지 못했습니다');
};


exports.bid = function (socket, room, userEntry, msg) {
    if(!room.onUserBid(userEntry, msg)) return socket.emit('err', '공약을 걸 수 없습니다.');
};


exports.bidch1 = function (socket, room, userEntry, msg) {
    if(!room.onBidChange1(userEntry, msg)) return socket.emit('err', '공약 변경을 할 수 없습니다.');
};

exports.discard3 = function (socket, room, userEntry, msg) {
    if(!room.onCardDiscard(userEntry, msg.cards)) return socket.emit('err', '해당 카드를 버릴 수 없습니다.');
};

exports.fsel = function (socket, room, userEntry, msg) {
    if(!room.onFriendSelectAndBidChange2(userEntry, msg)) return socket.emit('err', '프렌드 선택을 하지 못했습니다.');
};
