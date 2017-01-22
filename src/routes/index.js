const express = require('express');
const users = require('./users');
const crypto = require('crypto');

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
    res.cookie('roomID', roomID, {signed: true});
    res.cookie('accessID', crypto.randomBytes(16).toString('hex'), {signed: true});
    res.render('room');
});
