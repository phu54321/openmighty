/**
 * Created by whyask37 on 2017. 2. 14..
 */

"use strict";

const express = require('express');
const users = require('./users');
const gamelog = require('../models/gamelog');
const crypto = require('crypto');
const _ = require('lodash');


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


// 카드의 번호를 변환한다
const numStrList = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
function getCardNumString(num) {
    if(num === 0) return "";
    return numStrList[num - 2];
}

// Room
router.get('/log/:gameID', users.checkLogon, (req, res, next) => {
    const gameID = req.params.gameID | 0;

    gamelog.getGamelog(gameID, (err, entry) => {
        if(err) return next(err);

        let gusers = [];
        const pbiddings = [[], [], [], [], []];  // 각 플레이어가 했던 공약들
        const bidding = [];  // 공약 수정 등을 이유로 여러번 공약이 바뀔 수 있으므로 배열로 관리
        const tricks = [];
        let currentTrick = [];
        let president = null;
        const friend = {};

        // 뷰랑 모델을 분리하기가 어려워서 여기서는 그냥 template를 통해 html을 동적 생성합니다.
        // TODO: 뷰로 관련 로직을 옮긴다.

        const outputHtmls = [];

        // Simple log parser
        entry.gameLog.forEach(log => {
            if(log.type == 'gusers') {
                gusers = log.users;
            }
            else if(log.type == 'pbinfo') {
                pbiddings[log.bidder].push({
                    bidShape: log.bidShape,
                    bidCount: log.bidCount
                });
            }
            else if(log.type == 'binfo') {
                president = log.president;
                bidding.push({
                    bidShape: log.shape,
                    bidCount: log.num
                });
            }
            else if(log.type == 'fs') {
                friend.ftype = log.fype;
                friend.args = log.args;
            }
            else if(log.type == 'pcp') {
                currentTrick[log.player] = log.card;
            }
            else if(log.type == 'tend') {
                tricks.push({
                    cards: currentTrick,
                    winner: log.winner
                });
                currentTrick = [];
            }
        });

        console.log(
            gusers,
            pbiddings,
            bidding,
            friend,
            tricks
        );
        res.render('gamelog', {
            gameID: req.params.gameID,
            gameLog: JSON.stringify(entry.gameLog, null, 4),
            gusers: gusers,
            pbiddings: pbiddings,
            bidding: bidding,
            friend: friend,
            tricks: tricks
        });
    });
});
