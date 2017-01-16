/**
 * Created by whyask37 on 2017. 1. 11..
 */

function initSockets() {
    const socket = io();

    socket.on('err', function (msg) {
        Materialize.toast(msg, 4000);
    });

    socket.on('info', function (msg) {
        "use strict";
        console.log('info', msg);
    });


    socket.on('cmd', function (msg) {
        "use strict";
        console.log('cmd', msg);
        translateCmdMessage(msg);
    });

    socket.on('disconnect', function () {
        "use strict";
        // alert('서버와의 연결이 끊겼습니다.');
    });
}

function sendCmd(type, object) {
    "use strict";

    const copy = Object.assign({}, object || {});
    copy.type = type;
    socket.emit('cmd', copy);
    return true;
}

////

const cmdTranslatorMap = {};

function translateCmdMessage(msg) {
    "use strict";
    if(cmdTranslatorMap[msg.type]) cmdTranslatorMap[msg.type](msg);
    else Materialize.toast('Unknown command message type' + msg.type, 5000);
}
