/**
 * Created by whyask37 on 2017. 1. 23..
 */

const MightyRoom = require('../server/logic/mighty');
const AIBot = require('./aiBot');
const async = require('async');

const room = new MightyRoom('aiTester', 'airoom');

function asyncLoop(iterations, func, callback) {
    let i = 0;

    function next() {
        "use strict";
        i++;
        if (i == iterations) callback();
        else func(i, next);
    }

    func(i, next);
}

asyncLoop(5, (i, next) => {
    "use strict";
    const aiUserName = 'AI' + i;
    room.addUser(null, aiUserName, aiUserName, (err, userEntry) => {
        if(err) console.log(err);
        userEntry.socket = new AIBot(room, userEntry);
        next();
    });
}, () => {
    "use strict";
    room.onStartGame();
});
