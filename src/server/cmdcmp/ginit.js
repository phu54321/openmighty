/**
 * Created by whyask37 on 2017. 2. 4..
 */


"use strict";

const cmdcmp = require('./cmdcmp');
const card = require('./card');

cmdcmp.registerCompressor({
    type: 'gusers',
    shead: 'U',
    cmpf: (obj) => {
        const msg = ['U'];
        obj.users.forEach((user) => {
            msg.push(user.username);
            msg.push(user.useridf);
        });
        return msg.join('\0');
    },
    dcmpf: (s) => {
        const slist = s.split('\0');
        const users = [];
        for (let i = 1; i < slist.length; i += 2) {
            users.push({
                username: slist[i],
                useridf: slist[i + 1],
            });
        }
        return {
            type: 'gusers',
            users: users
        };
    }
});

cmdcmp.registerCompressor({
    type: 'deck',
    shead: 'D',
    cmpf: (obj) => {
        const msg = ['D'];
        obj.deck.forEach((c) => {
            msg.push(c.cardEnvID);
        });
        return msg.join('\0');
    },
    dcmpf: (s) => {
        const slist = s.split('\0');
        const deck = slist.slice(1).map(card.decodeCard);
        return {
            type: 'deck',
            users: deck
        };
    }
});

