/**
 * Created by whyask37 on 2017. 2. 10..
 */

"use strict";

const MockSocket = require('./MockSocket');
const server = require('../server/server');
const cmdcmp = require('../server/cmdcmp/cmdcmp');

describe('#Server', function() {
    describe('#onConnect', function() {
        it('should allow connection', function(done) {
            const socket1 = new MockSocket(1, 0, 0);
            socket1.onEmit('err', function (msg) {
                console.log(msg);
            });
            socket1.onEmit('info', function (msg) {
                console.log(msg);
            });
            socket1.onEmit('cmd', function (msg) {
                msg = cmdcmp.decompressCommand(msg);
                if(msg.type == 'rusers') done();
            });

            server.onConnect(socket1);
        });
    });
});
