/**
 * Created by whyask37 on 2017. 1. 19..
 */

"use strict";

const Materialize = window.Materialize;
const io = window.io;

const cmdcmp = require('../../server/cmdcmp/cmdcmp');
const cmdproc = require('./procCmd');
const cardImage = require('./cardImage');

let socket;

const $gameDiv = $('#gameDiv');
if($gameDiv.length !== 0) {
    $gameDiv.ready(function() {
        Materialize.toast('로딩중', 1500);
        cardImage(initSocket);
    });
}

function initSocket() {
    socket = io();

    socket.on('err', function (msg) {
        Materialize.toast(msg, 3000);
    });

    socket.on('info', function (msg) {
        "use strict";
        // console.log('info', msg);
    });


    socket.on('cmd', function (msg) {
        "use strict";
        const dcmp = cmdcmp.decompressCommand(msg);
        cmdproc.translateCmdMessage(dcmp);
    });

    socket.on('reconnect', function () {
        "use strict";
        // alert('재접속되었습니다.');
    });

    socket.on('disconnect', function () {
        "use strict";
        // alert('서버와의 연결이 끊겼습니다.');
    });
}

exports.emit = function (type, msg) {
    "use strict";
    if(socket) socket.emit(type, msg);
    else {
        console.log('Socket not yet initialized : ', type, msg);
    }
};

window.sendCmd = exports.sendCmd;

const sendCmd = require('./sendCmd');
sendCmd.setEmitFunc(exports.emit);

