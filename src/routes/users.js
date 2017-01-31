"use strict";

const passport = require('passport');
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const users = require('../models/users');


/// Login
router.post('/users/login', function (req, res, next) {
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
router.post('/users/logout', function (req, res) {
    if (!req.user) {  // Not logged in -> Failed
        return res.json({error: '로그인 상태가 아닙니다.'});
    }
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

    users.addUser({
        username: username,
        password: password,
        email: email,
    }, function (err, userid) {
        if (err) return res.json({error: '가입에 실패했습니다 : ' + err.message});
        // 해당 유저로 자동 로그인까지
        req.login(userid, function (err) {
            if (err) return res.json({error: err.message});
            else return res.json({error: 0});
        });
    });
});


// Utility function
router.checkLogon = function (req, res, next) {
    'use strict';
    if (req.user) return next();
    else return res.render('login');
};


module.exports = router;
