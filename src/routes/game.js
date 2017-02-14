/**
 * Created by whyask37 on 2017. 2. 14..
 */

"use strict";

const express = require('express');
const users = require('./users');
const gamelog = require('../models/gamelog');
const crypto = require('crypto');

let router = express.Router();
module.exports = router;

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

// Room
router.get('/log/:gameID', users.checkLogon, (req, res) => {
    const gameID = req.params.gameID | 0;

    gamelog.getGamelog(gameID, (err, entry) => {
        console.log(err, entry);
    });

    res.render('gamelog', {
        gameID: req.params.gameID
    });
});
