/**
 * Created by whyask37 on 2017. 1. 19..
 */

"use strict";

const Materialize = window.Materialize;
const io = window.io;

const cmdproc = require('./procCmd');

let socket;


const $gameDiv = $('#gameDiv');
if($gameDiv.length != 0) {
    $gameDiv.ready(function () {
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
            // console.log('cmd', msg);
            cmdproc.translateCmdMessage(msg);
        });

        socket.on('disconnect', function () {
            "use strict";
            // alert('서버와의 연결이 끊겼습니다.');
        });
    });
}

exports.sendCmd = function (type, object) {
    "use strict";

    const copy = Object.assign({}, object || {});
    copy.type = type;
    socket.emit('cmd', copy);
    return true;
};

window.sendCmd = exports.sendCmd;
