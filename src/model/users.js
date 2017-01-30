/**
 * Created by whyask37 on 2017. 1. 29..
 */

"use strict";

const db = require('./db');

/**
 * Add user to db
 * @param userinfo - User info in dictionary
 * @param cb - Callback
 */
exports.addUser = function (userinfo, cb) {
    db('users').insert({
        username: userinfo.username,
        password: userinfo.password,
        email: userinfo.email
    })
        .then(function (id) {
            cb(null, id);
        }, function (err) {
            cb(err);
        });
};

/**
 * Find user by Username
 * @param username
 * @param cb
 */
exports.findUserWithUsername = function (username, cb) {
    db('users')
        .select('id', 'username', 'email')
        .where({username: username})
        .limit(1)
        .then(function (entry) {
            cb(null, entry[0]);
        }, function (err) {
            cb(err);
        });
};

/**
 * Find user by ID
 * @param id
 * @param cb
 */
exports.findUserByID = function (id, cb) {
    db('users')
        .select('id', 'username', 'email')
        .where({id: id})
        .limit(1)
        .then(function (entry) {
            cb(null, entry[0]);
        }, function (err) {
            cb(err);
        });
};
