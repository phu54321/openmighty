const express = require('express');
const router = express.Router();
const crypto = require('crypto');

router.get('/register', function (req,res) {
    let newUserIdf = crypto.randomBytes(8).toString('hex');
    return res.render('join', {useridf: newUserIdf});
});

router.post('/logout', function (req, res) {
    const keyList = ['identity', 'roomID'];
    keyList.forEach((prop) => {
        res.clearCookie(prop);
    });
    res.json({error: 0});
});

router.post('/register', function(req, res) {
    const username = req.body.username;
    if(username === '') {
        return res.json({error: '이름을 입력하세요.'});
    }
    else if(!username || typeof username != 'string') {
        return res.json({error: '잘못된 접근입니다'});
    }

    let useridf = crypto.randomBytes(20).toString('hex');
    let identity = {
        username: username,
        useridf: useridf
    };
    const year = 31536000000;
    res.cookie(
        'identity',
        JSON.stringify(identity),
        {
            signed: true,
            expires: new Date(Date.now() + 3 * year),  // Expire after 3 year (yay)
            httpOnly: true
        }
    );
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
