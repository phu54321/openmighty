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
const users = require('../model/users');
const db = require('../model/db');
const async = require('async');

////

describe('User', function() {
    beforeEach(function(done) {
        db('users').truncate().then(() => done());
    });

    describe('#addUser', function() {
        it('should add user to database', function (done) {
            async.waterfall([
                (cb) => users.addUser({ username: 'test', password: 'password' }, cb),
                (_, cb) =>  users.findUserWithUsername('test', cb),
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
                (cb) => users.addUser({username: 'test', password: 'password'}, cb),
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
                (cb) => users.addUser({ username: 'test1', password: 'password' }, cb),
                (_, cb) => users.addUser({ username: 'test2', password: 'password' }, cb),
                (_, cb) => users.findUserWithUsername('test1', cb),
                (user, cb) => {
                    assert.equal(user.username, 'test1');
                    users.findUserWithUsername('test2', cb);
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
                (cb) => users.addUser({username: 'test', password: 'password'}, cb),
                (userid, cb) => {
                    expected_userid = userid;
                    users.authenticate('test', 'password', cb);
                },
                (userid, cb) => {
                    assert(expected_userid == userid);
                    cb(null);
                }
            ], (err) => {
                done(err);
            });
        });

        it('should reject bad username', function (done) {
            async.waterfall([
                (cb) => users.addUser({username: 'test', password: 'password'}, cb),
                (_, cb) => users.authenticate('test1', 'password', cb),
                (userid, cb) => {
                    assert(userid === null);
                    cb();
                }
            ], (err) => {
                done(err);
            });
        });

        it('should reject bad password', function (done) {
            async.waterfall([
                (cb) => users.addUser({username: 'test', password: 'password'}, cb),
                (_, cb) => users.authenticate('test', 'password1', cb),
                (userid, cb) => {
                    assert(userid === null);
                    cb();
                }
            ], (err) => {
                done(err);
            });
        });
    });
});
