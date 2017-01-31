/**
 * Created by whyask37 on 2017. 1. 29..
 */

"use strict";

const db = require('./db');
const bcrypt = require('bcrypt');
const deasync = require('deasync');
const async = require('async');

// SCHEMA
let dbInitialized = false;
db.schema.hasTable('users').then(function(exists) {
    if (exists) dbInitialized = true;
    else {
        db.schema.createTable('users', function(table) {
            table.increments('id').primary();
            table.string('username').unique();
            table.string('email').unique();
            table.string('pwhash');
            table.boolean('activated');
            table.timestamps();
        }).then(() => {
            dbInitialized = true;
        });
    }
});

while(!dbInitialized) {
    deasync.sleep(100);
}


//// Utility functions


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
 * Add user to db
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
        })
            .then(function (id) {
                cb(null, id);
            }, function (err) {
                cb(err);
            });
    });
};


/**
 * Authenticate by username & password
 * @param username
 * @param password
 * @param callback(err, accountId)
 */
exports.authenticate = function (username, password, callback) {
    let entry;
    async.waterfall([
        (cb) => db('users')
            .select('id', 'pwhash')
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
            return callback(null, entry.id);
        }
        else {
            return callback(null, null);
        }
    });
};


/**
 * Find user by Username
 * @param username
 * @param callback(err, entry)
 */
exports.findUserWithUsername = function (username, callback) {
    db('users')
        .select('id', 'username')
        .where({username: username})
        .limit(1)
        .then(function (entry) {
            callback(null, entry[0]);
        }, function (err) {
            callback(err);
        });
};

/**
 * Find user by ID
 * @param id
 * @param cb
 */
exports.findUserByID = function (id, cb) {
    db('users')
        .select('id', 'username')
        .where({id: id})
        .limit(1)
        .then(function (entry) {
            cb(null, entry[0]);
        }, function (err) {
            cb(err);
        });
};
