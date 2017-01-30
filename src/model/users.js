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
        .then(function (id) {
            cb(null);
        })
        .catch(function (err) {
            cb(err);
        });
};

exports.findUserWithUsername = function (username, cb) {
    cb(null, {username: 'test'});
};
