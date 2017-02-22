"use strict";

const passport = require('passport');
const express = require('express');
const crypto = require('crypto');
const users = require('../models/users');
const async = require('async');
const usergame = require('../models/usergame');


const router = express.Router();
module.exports = router;

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
        (cb) => users.addUser(req.headers.host, {username: username, password: password, email: email}, cb),
        (userid, cb) => users.getUserByID(userid, cb),
    ], (err) => {
        if(err) {
            global.logger.error(err);
            return res.json({error: '가입에 실패했습니다.'});
        }
        else return res.json({error: 0});
    });
});


router.get('/activate/:activateCode', function (req, res, next) {
    const activateCode = req.params.activateCode || "";
    users.activateUser(activateCode, (err) => {
        if(err) return next(err);
        res.redirect('/');
    });
});


// Utility function
router.checkLogon = function (req, res, next) {
    'use strict';
    if (req.user) return next();
    else return res.render('login');
};


///////////////////////

// Profile page
router.get('/profile/:username', router.checkLogon, function (req, res, next) {
    const username = req.params.username || "";
    users.getUserByUsername(username, (err, user) => {
        if(err) return next(err);
        if(user === undefined) {
            return res.render('error', {
                message: `유저 ${username}은 존재하지 않습니다.`
            });
        }

        usergame.listUserGameLogs(user.id, 1, (err, logs) => {
            if(err) return next(err);
            return res.render('profile', {user: user, logs: logs});
        });
    });
});

