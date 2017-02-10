/**
 * Created by whyask37 on 2017. 2. 10..
 */

"use strict";

const cmdcmp = require('../../server/cmdcmp/cmdcmp');
const conn = require('./conn');

let emitFunc;

exports.setEmitFunc = function (f) {
    emitFunc = f;
};


function sendCmd(type, object) {
    const copy = Object.assign({}, object || {});
    copy.type = type;
    console.log(copy);
    emitFunc('cmd', cmdcmp.compressCommand(copy));
    return true;
}


/////////////////////

exports.sendStartGame = function () {
    sendCmd('start');
};

////

exports.sendBidding = function (bidShape, bidCount) {
    sendCmd('bid', {
        shape: bidShape,
        num: parseInt(bidCount)
    });
};

exports.sendBidChange1 = function (bidShape, bidCount) {
    sendCmd('bc1', {
        shape: bidShape,
        num: bidCount
    });
};

exports.sendFriendSelectAndDiscard3 = function (msg) {
    sendCmd('fs', msg);
};

////

exports.sendCardPlay = function (cardIdx, opt) {
    opt = opt || {
        jcall: false,
    };
    const jcall = opt.jcall || undefined;
    const callShape = opt.callShape || undefined;

    sendCmd('cp', {
        cardIdx: cardIdx,
        jcall: jcall,
        srq: callShape
    });
};


