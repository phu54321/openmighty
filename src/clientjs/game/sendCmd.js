/**
 * Created by whyask37 on 2017. 2. 10..
 */

"use strict";

const cmdcmp = require('../../server/cmdcmp/cmdcmp');
const conn = require('./conn');

function sendCmd(type, object) {
    const copy = Object.assign({}, object || {});
    copy.type = type;
    console.log(copy);
    conn.emit('cmd', cmdcmp.compressCommand(copy));
    return true;
}


/////

exports.sendBidding = function (bidShape, bidCount) {
    sendCmd('bid', {
        shape: bidShape,
        num: parseInt(bidCount)
    });
};
