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

/**
 * Create new gamelog session
 */
exports.createGamelog = function (game, cb) {
    db('gamelog').insert({
        gameType: 'mighty5',
        players: game.gameUsers.map(user => user.useridf).join(','),
        gameLog: `[V${GAMELOG_VERSION}]`
    })
        .then(function (gameID) {
            cb(null, new GameLog(game, gameID));
        }, function(err) {
            cb(err);
        });
};



///////

const GAMELOG_VERSION = 3;

function GameLog(game, gameID) {
    this.game = game;
    this.gameID = gameID;
    this.completed = false;
    this.logText = 'V' + GAMELOG_VERSION;

    this.dbTasks = [];
    this.isIdle = true;
}

let taskID = 0;

GameLog.prototype.addTask = function (taskf, cb) {
    this.dbTasks.push([taskID, taskf, cb]);
    taskID += 1;
    if(this.isIdle) this.runTask();
};

GameLog.prototype.runTask = function () {
    const [taskID, taskf, cb] = this.dbTasks.splice(0, 1)[0];
    this.isIdle = false;
    taskf(() => {
        if(this.dbTasks.length === 0) this.isIdle = true;
        else process.nextTick(this.runTask.bind(this));
        if(cb) cb(...arguments);
        else {
            const err = arguments[0];
            if(err) {
                global.logger.error('General runTask error', err);
            }
        }
    });
};


///////

/**
 * 게임 로그를 넣습니다.
 * @param msg
 * @param cb
 * @returns {*}
 */
GameLog.prototype.addGameLog = function (msg, cb) {
    this.addTask((cb) => {
        if (this.completed) {
            return cb(new Error(`Tried to append log to completed game #${this.gameID}.`));
        }

        this.logText += ',' + JSON.stringify(msg);
        return db('gamelog')
            .where({id: this.gameID})
            .update({gameLog: `[${this.logText}]`})
            .asCallback(cb);
    }, cb);
};


/**
 * GameLog를 종결하고 DB에 해당 게임이 종료됬음을 알린다.
 *
 * this.completed를 addUserGameLogs에서 체크하기 때문에 여기서는 이중으로
 * completeGameLog가 불릴 가능성이 있음에도 불구하고 completed 유무를 의도적으fh
 * 체크하지 않는다.
 *
 * @param cb
 */
GameLog.prototype.completeGameLog = function (cb) {
    this.addTask((cb) => {
        if (!this.completed) {
            this.completed = true;
            delete this.logText;
        }

        // Add completed flag to gamelog

        db('gamelog')
            .where({id: this.gameID})
            .update({completed: true})
            .asCallback(cb);
    }, cb);
};


/**
 * 플레이가 끝까지 진행됬을 경우 유저들의 로그를 남긴다.
 *
 * 엄밀히 말하면 이 함수만으로 gameLog 처리가 끝나지는 않지만, 이미 유저로그가
 * 반영된 이후로 게임로그를 계속 쌓을 일이 없기 때문에 추가 버그 방지를 위해
 * 이 함수에서도 this.completed를 설정한다. 이 함수 호출 이후 completeGameLog
 * 함수를 호출해야 실제로 게임 로깅이 종결되게 된다.
 *
 * @param cb
 * @returns {*}
 */
GameLog.prototype.addUserGameLogs = function (cb) {
    this.addTask((cb) => {
        if (this.completed) {
            return cb(new Error(`Tried to end completed game #${this.gameID}.`));
        }

        this.completed = true;  // Barrier!
        delete this.logText;

        const game = this.game;
        const gameID = this.gameID;

        // Update user scores.
        const promises = game.gameUsers.map((user, userIdx) => {
            let score = game.scores[userIdx];
            if (typeof(user.useridf) == 'string') {
                return db('usergame').insert({
                    userid: -1,
                    gameid: gameID,
                    score: score
                });
            }
            else {
                if (user.ai) score = -40;  // Room leaving penalty
                return db('usergame').insert({
                    userid: user.useridf,
                    gameid: gameID,
                    score: score
                });
            }
        });

        // Execute all promises!
        Promise.all(promises)
            .then(() => {
                return cb(null);
            }, (err) => cb(err));
    }, cb);
};
