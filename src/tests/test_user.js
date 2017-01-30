/**
 * Created by whyask37 on 2017. 1. 30..
 */

/**
 * Created by whyask37 on 2017. 1. 22..
 */

"use strict";

const assert = require('assert');
const users = require('../model/users');
const async = require('async');

////

describe('User', function() {
    describe('#addUser', function() {
        it('should add user to database', function(done) {
            async.waterfall([
                (cb) => users.addUser({
                    username: 'test',
                    password: 'password'
                }, cb),
                (cb) => {
                    users.findUserWithUsername('test', cb);
                },
                (user, cb) => {
                    assert.equal(user.username, 'test', 'Invalid username!');
                    cb();
                }
            ], (err) => {
                done(err);
            });
        });
    });
});
