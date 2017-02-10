/**
 * Created by whyask37 on 2017. 2. 10..
 */

"use strict";

const MockSocket = require('./MockSocket');
const server = require('../server/server');
const roomlist = require('../server/roomlist');
const sendcmd = require('../clientjs/game/sendCmd');
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
                if(msg.type == 'rusers') {
                    socket1.inDisconnect();
                    done();
                }
            });
            server.onConnect(socket1);
        });


        it('should disallow rejoining', function(done) {
            let socket1;
            async.series([
                // Connect socket 1
                (cb) => {
                    socket1 = new MockSocket(1, 0, 0);
                    socket1.onEmit('cmd', function (msg) {
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

        it('should disallow joining to full room', function(done) {
            let sockets = [];

            // Create 5 connections
            async.each([0, 1, 2, 3, 4],
                // Connect socket 1
                (num, cb) => {
                    const socket = new MockSocket(num, 0, num);
                    socket.onEmit('cmd', function (msg) {
                        if (msg.type == 'rusers') {
                            sockets.push(socket);
                            cb();
                        }
                    });
                    server.onConnect(socket);
                },
                (err) => {
                    if (err) return done(err);
                    const socket = new MockSocket(5, 0, 5);
                    socket.onEmit('err', function (msg) {
                        done();
                    });
                    server.onConnect(socket);
                });
        });

        it('should disallow joining to playing room', function (done) {
            let socket1;
            async.series([
                // Connect socket 1
                (cb) => {
                    socket1 = new MockSocket(1, 0, 0);
                    socket1.onEmit('cmd', function (msg) {
                        if (msg.type == 'rusers') {
                            sendcmd.setEmitFunc(socket1.inMsg.bind(socket1));
                            cb();
                        }
                    });
                    server.onConnect(socket1);
                },

                // Issue game start
                (cb) => {
                    socket1.onEmit('cmd', function (msg) {
                        if (msg.type == 'gusers') {
                            cb();
                        }
                    });
                    sendcmd.sendStartGame();
                },

                // Connect socket 2. This should fail
                (cb) => {
                    const socket2 = new MockSocket(2, 0, 2);
                    socket2.onEmit('err', function (msg) {
                        cb();
                    });
                    server.onConnect(socket2);
                }
            ], done);
        })
    });
});
