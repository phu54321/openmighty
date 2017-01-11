const express = require('express');
const users = require('./users');
let router = express.Router();
module.exports = router;

// Intro page
router.get('/', users.checkLogon, function(req, res) {
    res.render('index', {title: '방 찾기'});
});

// Room
router.get('/:room', users.checkLogon, (req, res) => {
    const roomID = req.params.room;
    res.cookie('roomID', roomID, {signed: true, httpOnly: false});
    res.render('room');
});
