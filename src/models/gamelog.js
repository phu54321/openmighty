/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const db = require('./db');
const async = require('async');
const cmdcmp = require('../server/cmdcmp/cmdcmp');


// SCHEMA
db.initScheme('gamelog', function(table) {
    table.increments('id').primary();
    table.integer('version');
    table.boolean('completed').defaultTo(false);
    table.string('gameType').index();
    table.string('players');
    table.text('gameLog');
    table.timestamps(true, true);
});

/**
 * Create new gamelog session
 */
exports.createGamelog = function (game, cb) {
    db('gamelog').insert({
        gameType: 'mighty5',
        version: GAMELOG_VERSION,
        players: game.gameUsers.map(user => user.useridf).join(','),
        gameLog: `[]`
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
    this.logText = "";

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

        if(this.logText !== "") this.logText += ',';
        this.logText += JSON.stringify(msg);
        return db('gamelog')
            .where({id: this.gameID})
            .update({
                gameLog: `[${this.logText}]`,
                updated_at: new Date()
            })
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
            .update({
                completed: true,
                updated_at: new Date()
            })
            .asCallback(cb);
    }, cb);
};


/**
 * Get gamelog from game id
 * @param gameID
 * @param cb
 */
exports.getGamelog = function (gameID, cb) {
    global.logger.debug(`Getting game log #${gameID}`);

    db('gamelog')
        .select('*')
        .where({id: gameID})
        .limit(1)
        .then(function (entries) {
            const entry = entries[0];
            if(!entry) return cb(null, null);  // 없는 게임
            if(!entry.completed) {
                global.logger.debug(`Tried to get incomplete game ${gameID}`);
                return cb(null, null);  // 아직 끝나지 않은 게임
            }

            // Process entries
            let gameLogString = entry.gameLog;
            if(gameLogString.startsWith('[V3,')) {
                gameLogString = '["V3", ' + gameLogString.substr(4);
            }

            try {
                entry.gameLog = JSON.parse(gameLogString)
                    .map(entry => cmdcmp.decompressCommand(entry));

                // For legacy strings
                let version = entry.version;
                if(version === null) {
                    const versionString = entry.gameLog[0];

                    // Check version string
                    if (
                        typeof(versionString) != 'string' || !versionString.startsWith('V')
                    ) {
                        global.logger.debug(`Game ${gameID} has bad vstring ${versionString}`);
                        return cb(null, null);
                    }

                    // Check version
                    version = (entry.gameLog[0].substr(1) | 0);
                    if (version < 3) {
                        global.logger.debug(`Game ${gameID} has bad version ${version}`);
                        return cb(null, null);
                    }
                    entry.gameLog.splice(0, 1);
                }

                // Migrate versions if nessecary
                return cb(null, entry);
            }
            catch(e) {
                return cb(e);
            }
        }, function(err) {
            cb(err);
        });
};

require('./usergame')(GameLog);
