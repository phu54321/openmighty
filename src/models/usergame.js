/**
 * Created by whyask37 on 2017. 2. 17..
 */


"use strict";

const db = require('./db');
const async = require('async');

db.initScheme('usergame', function (table) {
    table.increments('id').primary();
    table.integer('userid').index();
    table.integer('gameid');
    table.integer('score');
    table.timestamps(true, true);
});

exports = module.exports = function (GameLog) {
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

            console.log(this);

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
};


/**
 * List user game logs
 */
exports.listUserGameLogs = function (userid, page, cb) {
    page = (page || 1) - 1;
    db('usergame')
        .select('*')
        .where({userid: userid})
        .orderBy('id', 'desc')
        .limit(40)
        .offset(page * 40)
        .asCallback(cb);
};
