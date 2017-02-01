const express = require('express');
const crypto = require('crypto');
const users = require('../routes/users');

let router = express.Router();
module.exports = router;

// Intro page
router.get('/', users.checkLogon, function(req, res) {
    res.render('index', {title: '방 찾기'});
});


// Room
router.get('/:room', users.checkLogon, (req, res) => {
    const roomID = req.params.room;
    if(!/^[0-9a-zA-Z]{8}$/.test(roomID)) {
        return res.render('index', {title: '방 찾기', errormsg: '잘못된 방 번호입니다.'});
    }
    req.session.roomID = roomID;
    req.session.accessID = crypto.randomBytes(16).toString('hex');
    res.render('room');
});
