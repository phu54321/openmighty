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

        if(entry === null) {
            return res.render('error', {message: "로그를 불러올 수 없습니다."});
        }

        let gusers = [];
        const pbiddings = [[], [], [], [], []];  // 각 플레이어가 했던 공약들
        const biddings = [];  // 공약 수정 등을 이유로 여러번 공약이 바뀔 수 있으므로 배열로 관리
        let currentTrick = {cards: []};
        const tricks = [currentTrick];
        let president = null;
        let friend;
        let result;
        let abortReason;

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
                biddings.push({
                    bidShape: log.shape,
                    bidCount: log.num
                });
            }
            else if(log.type == 'fs') {
                friend = log;
            }
            else if(log.type == 'pcp') {
                currentTrick.cards[log.player] = log.card;
            }
            else if(log.type == 'tend') {
                currentTrick.winner = log.winner;
                currentTrick = {
                    cards: [],
                };
                tricks.push(currentTrick);
            }
            else if(log.type == 'gend') {
                result = log;
            }
            else if(log.type == 'gabort') {
                abortReason = log.msg;
            }
        });

        // BUGFIX - tricks가 하나도 없을 경우 tricks에 일단 넣어둔 currentTrick을 없앤다.
        if(
            tricks.length == 1 &&
            currentTrick.cards.length === 0
        ) tricks.splice(0, 1);

        res.render('gamelog', {
            gameID: req.params.gameID,
            getCardNumString: getCardNumString,
            gamelog: entry.gameLog,

            gusers: gusers,
            pbiddings: pbiddings,
            president: president,
            biddings: biddings,
            lastBidding: biddings[biddings.length - 1],
            friend: friend,
            tricks: tricks,
            result: result,

            abortReason: abortReason
        });
    });
});
