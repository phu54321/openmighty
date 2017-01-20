/**
 * Created by whyask37 on 2017. 1. 19..
 */

"use strict";

const game = require('./game');
const Materialize = window.Materialize;

module.exports = function (cmdTranslatorMap) {
    cmdTranslatorMap.rjoin = function (msg) {
        "use strict";
        Materialize.toast(msg.username + '님이 입장하셨습니다.', 4000);
        game.room.users.push({
            username: msg.username,
            useridf: msg.useridf
        });
        game.viewRoom();
    };

    cmdTranslatorMap.rleft = function (msg) {
        "use strict";
        const users = game.room.users;
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.useridf == msg.useridf) {
                Materialize.toast(user.username + '님이 퇴장하셨습니다.', 4000);
                users.splice(i, 1);
                break;
            }
        }
        game.room.owner = msg.owner;
        if (!game.room.playing) game.viewRoom();
    };

    cmdTranslatorMap.rusers = function (msg) {
        "use strict";
        const room = game.room;
        room.owner = msg.owner;
        room.users = msg.users;
        room.myidf = msg.youridf;
        game.viewRoom();
    };
};
