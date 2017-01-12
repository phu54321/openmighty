/**
 * Created by whyask37 on 2017. 1. 12..
 */
"use strict";

const roomsys = require('./../roomlist');

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
