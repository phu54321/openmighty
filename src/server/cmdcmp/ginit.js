/**
 * Created by whyask37 on 2017. 2. 4..
 */


"use strict";

const cmdcmp = require('./cmdcmp');
const utils = require('./utils');

cmdcmp.registerCompressor({
    type: 'gusers',
    shead: 'U',
    cmpf: (obj) => {
        const msg = ['U'];
        obj.users.forEach((user) => {
            msg.push(user.username);
            msg.push(user.useridf);
            msg.push(user.rating);
        });
        return msg.join(';');
    },
    dcmpf: (s) => {
        const slist = s.split(';');
        const users = [];
        for (let i = 1; i < slist.length; i += 3) {
            users.push({
                username: slist[i],
                useridf: slist[i + 1],
                rating: Number(slist[i + 2])
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
        return msg.join(';');
    },
    dcmpf: (s) => {
        const slist = s.split(';');
        const deck = slist.slice(1).map(utils.decodeCard);
        return {
            type: 'deck',
            deck: deck
        };
    }
});

