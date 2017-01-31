/**
 * Created by whyask37 on 2017. 1. 30..
 */

/**
 * Created by whyask37 on 2017. 1. 22..
 */

"use strict";

const knexfile = require('../../knexfile');
knexfile.development.connection.database = 'test';  // Mockup

const assert = require('assert');
const users = require('../models/users');
const db = require('../models/db');
const async = require('async');
const deasync = require('deasync');

////

function generateUser(username) {
    return {
        username: username,
        email: username + '@test.com',
        password: 'password'
    };
}

describe('User', function() {
    beforeEach(function(done) {
        db('users').truncate().then(() => done());
    });
    after(function(done) {
        db.schema.dropTable('users');
        done();
    });

    describe('#addUser', function() {
        it('should add user to database', function (done) {
            async.waterfall([
                (cb) => users.addUser(generateUser('test'), cb),
                (_, cb) =>  users.findUserByUsername('test', cb),
                (user, cb) => {
                    assert.equal(user.username, 'test');
                    cb();
                }
            ], (err) => {
                done(err);
            });
        });

        it('should do duplicate username check', function (done) {
            async.waterfall([
                (cb) => users.addUser(generateUser('test'), cb),
                (_, cb) => {
                    users.addUser({username: 'test', password: 'password'}, (err) => {
                        assert.notEqual(err, null);
                        cb(null);
                    });
                },
            ], (err) => {
                done(err);
            });
        });

        it('should be able to manage multiple accounts', function (done) {
            async.waterfall([
                (cb) => users.addUser(generateUser('test1'), cb),
                (_, cb) => users.addUser(generateUser('test2'), cb),
                (_, cb) => users.findUserByUsername('test1', cb),
                (user, cb) => {
                    assert.equal(user.username, 'test1');
                    users.findUserByUsername('test2', cb);
                },
                (user, cb) => {
                    assert.equal(user.username, 'test2');
                    cb(null);
                }
            ], (err) => {
                done(err);
            });
        });
    });

    describe('#authenticate', function() {
        it('should return valid userid', function (done) {
            let expected_userid;
            async.waterfall([
                (cb) => users.addUser(generateUser('test'), cb),
                (userid, cb) => {
                    expected_userid = userid;
                    users.authenticate('test', 'password', cb);
                },
                (entry, cb) => {
                    assert(expected_userid == entry.id);
                    cb(null);
                }
            ], (err) => {
                done(err);
            });
        });

        it('should reject bad username', function (done) {
            async.waterfall([
                (cb) => users.addUser(generateUser('test'), cb),
                (_, cb) => users.authenticate('test1', 'password', cb),
                (entry, cb) => {
                    assert(entry === null);
                    cb();
                }
            ], (err) => {
                done(err);
            });
        });

        it('should reject bad password', function (done) {
            async.waterfall([
                (cb) => users.addUser(generateUser('test'), cb),
                (_, cb) => users.authenticate('test', 'password1', cb),
                (entry, cb) => {
                    assert(entry === null);
                    cb();
                }
            ], (err) => {
                done(err);
            });
        });
    });
});
