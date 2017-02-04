/**
 * Created by whyask37 on 2017. 1. 29..
 */

"use strict";

const db = require('./db');
const bcrypt = require('bcrypt');
const async = require('async');

// SCHEMA
db.initScheme('users', function(table) {
    table.increments('id').primary();
    table.string('username').unique().index();
    table.string('email').unique();
    table.string('pwhash');
    table.boolean('activated').index();
    table.timestamps(true, true);
});

const userFields = ['id', 'username', 'email'];

///////





/**
 * 올바른 아이디인지
 * @param username
 * @returns {boolean}
 */
function isValidUsername(username) {
    return username && /^\w{4,16}$/.test(username);
}
exports.isValidUsername = isValidUsername;


/**
 * 올바른 이메일인지
 * @param email
 * @returns {boolean}
 */
function isValidEmail(email) {
    return email && /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}


/**
 * 유저를 새로 등록
 * @param userinfo - User info in dictionary
 * @param cb - Callback
 */
exports.addUser = function (userinfo, cb) {
    // Basic check
    if(!isValidEmail(userinfo.email) || !isValidUsername(userinfo.username)) {
        return cb(new Error('Incomplete data'));
    }
    // Create password hash
    bcrypt.hash(userinfo.password, 10, function(err, hash) {
        if(err) return cb(err);
        db('users').insert({
            username: userinfo.username,
            pwhash: hash,
            email: userinfo.email,
        })
            .then(function (id) {
                cb(null, id);
            }, function (err) {
                cb(err);
            });
    });
};


/**
 * 아이디와 패스워드로 유저 확인
 * @param username
 * @param password
 * @param callback(err, accountId)
 */
function authenticate(username, password, callback) {
    let entry;
    async.waterfall([
        (cb) => db('users')
            .select(userFields.concat(['pwhash']))
            .where({username: username})
            .limit(1).asCallback(cb),
        (entries, cb) => {
            if(entries.length === 0) return cb(1);
            entry = entries[0];
            bcrypt.compare(password, entry.pwhash, cb);
        }
    ], function (err, match) {
        if(err) return callback(null, null);
        if (match) {
            delete entry.pwhash;
            return callback(null, entry);
        }
        else {
            return callback(null, null);
        }
    });
}

exports.authenticate = authenticate;


/**
 * 아이디로 유저를 찾는다.
 * @param username
 * @param callback(err, entry)
 */
exports.findUserByUsername = function (username, callback) {
    db('users')
        .select(userFields)
        .where({username: username})
        .limit(1)
        .then(function (entry) {
            callback(null, entry[0]);
        }, function (err) {
            callback(err);
        });
};

/**
 * 유저를 아이디로 찾는다.
 * @param id
 * @param cb
 */
exports.findUserByID = function (id, cb) {
    db('users')
        .select(userFields)
        .where({id: id})
        .limit(1)
        .then(function (entry) {
            cb(null, entry[0]);
        }, function (err) {
            cb(err);
        });
};



////////////////////////////////////////////////////////

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    function (username, password, done) {
        'use strict';
        authenticate(username, password, function (err, userid) {
            if (err) return done(err);
            if (userid === null) return done(null, false, {message: '로그인에 실패했습니다.'});
            return done(null, userid);
        });
    }
));

passport.serializeUser(function (user, done) {
    'use strict';
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    'use strict';
    done(null, user);
});
