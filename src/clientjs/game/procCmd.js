/**
 * Created by whyask37 on 2017. 1. 11..
 */

"use strict";

const cmdTranslatorMap = {};
const Materialize = window.Materialize;

const game = require('./game');
const room = require('./room');

exports.translateCmdMessage = function (msg) {
    if(cmdTranslatorMap[msg.type]) cmdTranslatorMap[msg.type](msg);
    else Materialize.toast('Unknown command message type : ' + msg.type, 4000);
};

///////////////////////////////////

// Room users
require('./cmdRoom')(cmdTranslatorMap);
require('./cmdBidding')(cmdTranslatorMap);
require('./cmdFriendSelect')(cmdTranslatorMap);
require('./cmdMainGame')(cmdTranslatorMap);


cmdTranslatorMap.gabort = function (obj) {
    const msg = obj.msg || '게임이 중간에 종료되었습니다.';
    Materialize.toast(msg, 3000);
    room.playing = false;
    room.viewRoom();
    $('#title').text('openMighty');
};
