/**
 * Created by whyask37 on 2017. 1. 23..
 */

"use strict";



const training = true;
const test_count = 20;

const MightyRoom = require('../server/logic/mighty');
const AIBot = require('./aiBot');
const jsonfile = require('jsonfile');
const path = require('path');

const room = new MightyRoom('aiTester', 'airoom');

function asyncLoop(iterations, func, callback) {
    let i = 0;

    function next() {
        "use strict";
        i++;
        if (i == iterations) callback();
        else process.nextTick(() => func(i, next));
    }

    func(i, next);
}

let completedBots = 0;
let failedTry = 0;
let cb;
let bots = [];

function onBotComplete(score) {
    "use strict";
    completedBots += score;
    failedTry += this.failedTry;

    if(completedBots == 5) {
        cb(true);
    }
    else if(completedBots == -5) {
        cb(false);
    }
}

if(!training) AIBot.aiSpec.epsilon = 0;  // No random search

asyncLoop(5, (i, next) => {
    const aiUserName = 'AI' + i;
    room.addUser(null, aiUserName, aiUserName, (err, userEntry) => {
        if(err) console.log(err);
        const aiBot = new AIBot(room, userEntry);
        aiBot.training = training;
        aiBot.onEnd = onBotComplete;
        userEntry.socket = aiBot;
        bots.push(aiBot);
        next();
    });
}, function() {
    if(!training) {
        loadData();
    }
    loopMain();
});

let loopCount = 0;
let eps = 0.2;



var start = process.hrtime();

var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(note + " - " + process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms"); // print message + time
    start = process.hrtime(); // reset the timer
};

function loopMain() {
    completedBots = 0;
    failedTry = 0;
    cb = onBotComplete;

    room.onStartGame();
    function onBotComplete(gameDone) {
        if(gameDone) {
            loopCount++;
            eps -= AIBot.epsDelta;
            if(loopCount % 10 === 0) elapsed_time("Looped " + loopCount);
            if(training) {
                if (eps < 0.05) return saveData();
                if (loopCount % 100 == 0) saveData();
            }
            else {
                console.log(failedTry + '\n\n\n\n\n\n\n\n\n\n\n\n\n');
                if(loopCount == test_count) return;
            }
        }
        process.nextTick(loopMain);
    }
}

function loadData() {
    console.log('=============== Loading... =============');
    bots.forEach((bot) => {
        const outPath = path.join(__dirname, 'aidata/' + bot.userEntry.useridf + '.json');
        const botJson = jsonfile.readFileSync(outPath);
        bot.aiMap.fromJSON(botJson);
    });
    console.log('=============== Loading =============');
}


function saveData() {
    console.log('=============== Saving... =============');
    bots.forEach((bot) => {
        const outPath = path.join(__dirname, 'aidata/' + bot.userEntry.useridf + '.json');
        jsonfile.writeFileSync(outPath, bot.aiMap.toJSON());
    });
    console.log('=============== Saved =============');
}

