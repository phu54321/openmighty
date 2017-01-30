/**
 * Created by whyask37 on 2017. 1. 29..
 */

"use strict";

const db = require('./db');

exports.addUser = function (userinfo, cb) {
    db('users').insert({
        username: userinfo.username,
        password: userinfo.password,
        email: userinfo.email
    })
        .then(function () {
            cb(null);
        }, function (err) {
            cb(err);
        });
};

exports.findUserWithUsername = function (username, cb) {
    db('users')
        .select('username', 'email')
        .where({username: username})
        .limit(1)
        .then(function (entry) {
            cb(null, entry[0]);
        }, function (err) {
            cb(err);
        });
};
