/**
 * Created by whyask37 on 2017. 1. 29..
 */

"use strict";

const db = require('./db');
const bcrypt = require('bcrypt');
const deasync = require('deasync');

// SCHEMA
let dbInitialized = false;
db.schema.hasTable('users').then(function(exists) {
    if (exists) dbInitialized = true;
    else {
        db.schema.createTable('users', function(table) {
            table.increments('id').primary();
            table.string('username').unique();
            table.string('password');
            table.timestamps();
        }).then(() => {
            dbInitialized = true;
        });
    }
});

while(!dbInitialized) {
    deasync.sleep(100);
}


function isValidUsername(username) {
    return /^\w{4,12}$/.test(username);
}
exports.isValidUsername = isValidUsername;


/**
 * Add user to db
 * @param userinfo - User info in dictionary
 * @param cb - Callback
 */
exports.addUser = function (userinfo, cb) {
    db('users').insert({
        username: userinfo.username,
        password: userinfo.password,
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
        .select('id', 'username')
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
        .select('id', 'username')
        .where({id: id})
        .limit(1)
        .then(function (entry) {
            cb(null, entry[0]);
        }, function (err) {
            cb(err);
        });
};
