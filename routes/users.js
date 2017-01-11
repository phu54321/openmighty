const express = require('express');
const router = express.Router();
const crypto = require('crypto');

router.get('/register', function (req,res) {
    let newUserIdf = crypto.randomBytes(20).toString('hex');
    return res.render('join', {useridf: newUserIdf});
});

router.post('/logout', function (req, res) {
    res.clearCookie('identity');
    res.json({error: 0});
});

router.post('/register', function(req, res) {
    const username = req.body.username;
    if(!username) {
        return res.json({error: '잘못된 접근입니다'});
    }

    let useridf = crypto.randomBytes(20).toString('hex');
    let identity = {
        username: username,
        useridf: useridf
    };
    res.cookie('identity', JSON.stringify(identity), {signed: true, httpOnly: false});
    return res.json({error: 0});
});

router.checkLogon = function (req, res, next) {
    let identity = req.signedCookies.identity;
    if(!identity) {
        return res.render('join');
    }

    identity = JSON.parse(identity);
    let username = identity.username;
    let useridf = identity.useridf;
    req.username = username;
    req.useridf = useridf;
    return next();
};

module.exports = router;
