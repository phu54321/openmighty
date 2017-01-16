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
const room = {
    owner: 0,
    users: []
};

function viewRoom() {
    "use strict";

    const owner = room.owner;
    const users = room.users;

    const $playerSlots = $('.player-slot');
    for(let i = 0 ; i < users.length ; i++) {
        const $playerSlot = $($playerSlots[i]);
        const user = users[i];
        $playerSlot.attr('useridf', user.useridf);
        $playerSlot.find('.player-name').text(user.username);
        $playerSlot.removeClass('player-empty');
        if(owner == i) $playerSlot.addClass('player-owner');
    }

    for(let i = users.length ; i < 5 ; i++) {
        const $playerSlot = $($playerSlots[i]);
        $playerSlot.removeAttr('useridf');
        $playerSlot.find('.player-name').text("Empty");
        $playerSlot.addClass('player-empty');
        $playerSlot.removeClass('player-owner');
    }
}

function translateCmdMessage(msg) {
    "use strict";
    if(cmdTranslatorMap[msg.type]) cmdTranslatorMap[msg.type](msg);
    else Materialize.toast('Unknown command message type : ' + msg.type, 5000);
}

cmdTranslatorMap.rjoin = function (msg) {
    "use strict";
    Materialize.toast(msg.username + '님이 입장하셨습니다.');
    room.users.push({
        username: msg.username,
        useridf: msg.useridf
    });
    viewRoom();
};

cmdTranslatorMap.rleft = function (msg) {
    "use strict";
    for(let i = 0 ; i < room.users.length ; i++) {
        const user = room.users[i];
        if(user.useridf == msg.useridf) {
            Materialize.toast(user.username + '님이 퇴장하셨습니다.');
            room.users = room.users.splice(i, 1);
        }
    }
    room.owner = msg.owner;
    viewRoom();
};

cmdTranslatorMap.rusers = function (msg) {
    "use strict";
    room.owner = msg.owner;
    room.users = msg.users;
    viewRoom();
};
