/**
 * Created by whyask37 on 2017. 1. 19..
 */

"use strict";

const room = require('./room');
const game = require('./game');

const Materialize = window.Materialize;

module.exports = function (cmdTranslatorMap) {
    cmdTranslatorMap.rjoin = function (msg) {
        "use strict";
        Materialize.toast(msg.username + '님이 입장하셨습니다.', 2000);
        room.users.push({
            username: msg.username,
            useridf: msg.useridf
        });
        room.viewRoom();
    };

    cmdTranslatorMap.rleft = function (msg) {
        "use strict";
        const users = room.users;
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.useridf == msg.useridf) {
                if(room.playing) Materialize.toast(user.username + '님이 탈주하셨습니다.', 2000);
                else Materialize.toast(user.username + '님이 퇴장하셨습니다.', 2000);
                users.splice(i, 1);
                break;
            }
        }
        room.owner = msg.owner;
        if (room.playing) {
            const gameUsers = game.gameUsers;

            for (let i = 0 ; i < gameUsers.length ; i++) {
                if(gameUsers[i].useridf == msg.useridf) {
                    $($('.player-slot')[i]).addClass('player-ai');
                    break;
                }
            }
        }
        else room.viewRoom();
    };

    cmdTranslatorMap.rusers = function (msg) {
        "use strict";
        room.owner = msg.owner;
        room.users = msg.users;
        room.myidf = msg.youridf;
        room.viewRoom();
    };
};
