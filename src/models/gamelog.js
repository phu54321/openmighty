/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const db = require('./db');
const async = require('async');

// SCHEMA
db.initScheme('gamelog', function(table) {
    table.increments('id').primary();
    table.string('gameType').index();
    table.string('players');
    table.text('gameLog');
    table.timestamps(true, true);
});

db.initScheme('usergame', function (table) {
    table.increments('id').primary();
    table.integer('userid').index();
    table.integer('gameid');
    table.integer('score');
    table.timestamps(true, true);
});

///////


exports.addGameLog = function (game, cb) {
    db('gamelog').insert({
        gameType: 'mighty5',
        players: game.gameUsers.map(user => user.useridf).join(','),
        gameLog: game.gamelog.toString()
    })
        .then(function (gameId) {
            const promises = game.gameUsers.map((user, userIdx) => {
                let score = game.scores[userIdx];
                if(typeof(user.useridf) == 'string') {
                    return db('usergame').insert({
                        userid: -1,
                        gameid: gameId,
                        score: score
                    });
                }
                else {
                    if(user.ai) score = -30;  // Room leaving penelty;
                    return db('usergame').insert({
                        userid: user.useridf,
                        gameid: gameId,
                        score: score
                    });
                }
            });
            Promise.all(promises).then(() => cb(null), (err) => cb(err));
        }, function (err) {
            cb(err);
        });
};
