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

    afterEach(function(done) {
        db('users').truncate().then(() => done());
    });

    describe('#addUser', function() {
        it('should add user to database', function (done) {
            async.waterfall([
                (cb) => users.addUser({ username: 'test', password: 'password' }, cb),
                (cb) =>  users.findUserWithUsername('test', cb),
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
                (cb) => {
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
                (cb) => users.addUser({ username: 'test2', password: 'password' }, cb),
                (cb) => users.findUserWithUsername('test1', cb),
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
});
