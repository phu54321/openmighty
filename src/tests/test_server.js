/**
 * Created by whyask37 on 2017. 2. 10..
 */

"use strict";

const MockSocket = require('./MockSocket');
const server = require('../server/server');
const roomlist = require('../server/roomlist');
const cmdcmp = require('../server/cmdcmp/cmdcmp');
const async = require('async');
const deasync = require('deasync');

describe('#Server', function() {
    afterEach(function() {
        roomlist.UNITTEST_CleanRoomMap();
    });

    describe('#onConnect', function() {
        it('should allow connection', function(done) {
            const socket1 = new MockSocket(1, 0, 0);
            socket1.onEmit('cmd', function (msg) {
                msg = cmdcmp.decompressCommand(msg);
                if(msg.type == 'rusers') {
                    socket1.inDisconnect();
                    done();
                }
            });
            server.onConnect(socket1);
        });


        it('should disallow rejoining to full room', function(done) {
            let socket1;
            async.series([
                // Connect socket 1
                (cb) => {
                    socket1 = new MockSocket(1, 0, 0);
                    socket1.onEmit('cmd', function (msg) {
                        msg = cmdcmp.decompressCommand(msg);
                        if (msg.type == 'rusers') {
                            cb();
                        }
                    });
                    server.onConnect(socket1);
                },

                // Connect socket 2 colliding with socket 1.
                // This should fail
                (cb) => {
                    const socket2 = new MockSocket(1, 0, 0);
                    socket2.onEmit('err', function (msg) {
                        cb();
                    });
                    server.onConnect(socket2);
                },

                // Cleanup
                (cb) => {
                    socket1.inDisconnect();
                    cb();
                }
            ], done);
        });
    });
});
