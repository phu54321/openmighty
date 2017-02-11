/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const db = require('./db');
const async = require('async');

// SCHEMA
db.initScheme('gamelog', function(table) {
    table.increments('id').primary();
    table.boolean('completed').defaultTo(false);
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

const GAMELOG_VERSION = 3;

function GameLog(game, gameID) {
    this.game = game;
    this.gameID = gameID;
    this.completed = false;
    this.logText = 'V' + GAMELOG_VERSION;
}

/**
 * Create new gamelog session
 */
exports.createGamelog = function (game, cb) {
    db('gamelog').insert({
        gameType: 'mighty5',
        players: game.gameUsers.map(user => user.useridf).join(','),
        gameLog: 'V' + GAMELOG_VERSION
    })
        .then(function (gameID) {
            cb(null, new GameLog(game, gameID));
        }, function(err) {
            cb(err);
        });
};


///////

GameLog.prototype.addGameLog = function (msg, cb) {
    if(this.completed) {
        return cb(new Error(`Tried to append log to completed game #${this.gameID}.`));
    }

    this.logText += ',' + JSON.stringify(msg);

    db('gamelog')
        .where({id: this.gameID})
        .update({gameLog: this.logText})
        .asCallback(cb);
};

GameLog.prototype.endGamelog = function (cb) {
    if(this.completed) {
        return cb(new Error(`Tried to end completed game #${this.gameID}.`));
    }

    this.completed = true;  // Barrier!

    const game = this.game;
    const gameID = this.gameID;

    // Update user scores.
    const promises = game.gameUsers.map((user, userIdx) => {
        let score = game.scores[userIdx];
        if(typeof(user.useridf) == 'string') {
            return db('usergame').insert({
                userid: -1,
                gameid: gameID,
                score: score
            });
        }
        else {
            if(user.ai) score = -40;  // Room leaving penalty
            return db('usergame').insert({
                userid: user.useridf,
                gameid: gameID,
                score: score
            });
        }
    });

    // Add completed flag to gamelog
    promises.push(db('gamelog')
        .where({id: this.gameID})
        .update({completed: true}));

    // Execute all promises!
    Promise.all(promises)
        .then(() => {
            return cb(null);
        }, (err) => cb(err));
};
