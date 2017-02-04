/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const cmdcmp = require('./cmdcmp');


cmdcmp.registerCompressor({
    type: 'rjoin',
    shead: 'j',
    cmpf: (obj) => {
        return 'j' + obj.username + '\0' + obj.useridf;
    },
    dcmpf: (s) => {
        const matches = s.match(/^j(\w+)\0(\w+)$/);
        if(!matches) return null;
        return {
            type: 'rjoin',
            username: matches[1],
            useridf: matches[2]
        };
    }
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
        return msg.join('\0');
    },
    dcmpf: (s) => {
        const slist = s.split('\0');
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
    cmpf: (obj) => {
        return 'l' + obj.useridf + '\0' + obj.owner;
    },
    dcmpf: (s) => {
        const matches = s.match(/^l(\w+)\0(\d+)$/);
        if(!matches) return null;
        return {
            type: 'rleft',
            useridf: matches[1],
            owner: matches[2] | 0
        };
    }
});
