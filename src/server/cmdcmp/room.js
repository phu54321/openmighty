/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const cmdcmp = require('./cmdcmp');
const utils = require('./utils');

cmdcmp.registerCompressor({
    type: 'rjoin',
    shead: 'j',
    keys: ['username', 'useridf']
});


cmdcmp.registerCompressor({
    type: 'rusers',
    shead: 'u',
    cmpf: (obj) => {
        const msg = ['u', obj.owner];
        msg.push(obj.youridf);
        obj.users.forEach((user) => {
            msg.push(user.username);
            msg.push(user.useridf);
        });
        return msg.join(';');
    },
    dcmpf: (s) => {
        const slist = s.split(';');
        const users = [];
        for(let i = 3 ; i < slist.length ; i += 2) {
            users.push({
                username: slist[i],
                useridf: slist[i + 1],
            });
        }
        return {
            type: 'rusers',
            owner: slist[1] | 0,
            youridf: slist[2],
            users: users
        };
    }
});

cmdcmp.registerCompressor({
    type: 'rleft',
    shead: 'l',
    keys: ['useridf', 'Iowner']
});
