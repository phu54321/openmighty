/**
 * Created by whyask37 on 2017. 1. 12..
 */
"use strict";

const roomsys = require('./roomsys');

exports.ready = function (socket, room, userEntry, msg) {
    if(room.playing) return socket.emit('err', '이미 게임이 진행중입니다.');
    userEntry.ready = true;
    if(room.isAllPlayerReady()) {
        if(!room.startGame()) return socket.emit('err', '모든 플레이어가 레디했지만 게임 시작을 하지 못했습니다');
    }
};
