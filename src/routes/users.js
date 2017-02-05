"use strict";

const passport = require('passport');
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const users = require('../models/users');
const async = require('async');


/// Login
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({error: '아이디와 패스워드를 확인하세요.'});
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.json({error: 0});
        });
    })(req, res, next);
});


/// Logout
router.post('/logout', function (req, res) {
    if (!req.user) {  // Not logged in -> Failed
        return res.json({error: '로그인 상태가 아닙니다.'});
    }
    global.logger.info(`User ${req.user.username} (#${req.user.id}) has logged out`);
    req.logout();
    return res.json({error: 0});
});


/// Register

router.get('/join', function (req, res) {
    res.render('join');
});

router.post('/join', function (req, res) {
    const
        username = req.body.username,
        email = req.body.email,
        password = req.body.password;

    if (!email || !password || !username) {
        return res.json({error: '잘못된 정보입니다.'});
    }

    async.waterfall([
        (cb) => users.addUser({username: username, password: password, email: email}, cb),
        (userid, cb) => users.findUserByID(userid, cb),
        (userEntry, cb) => req.logIn(userEntry, cb)
    ], (err) => {
        if(err) {
            return res.json({error: '가입에 실패했습니다.'});
        }
        else return res.json({error: 0});
    });
});


// Utility function
router.checkLogon = function (req, res, next) {
    'use strict';
    if (req.user) return next();
    else return res.render('login');
};


module.exports = router;
