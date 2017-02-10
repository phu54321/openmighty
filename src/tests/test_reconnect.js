/**
 * Created by whyask37 on 2017. 1. 22..
 */

"use strict";

const assert = require('assert');
const MockSocket = require('./mocksocket');

////

/////////////////////////////////////////////////////

const rsock = require('../server/rsocket');

function createMock(accessID) {
    return new MockSocket(0, 1, accessID);
}

describe('RSocket', function() {
    it('should act as normal socket', function() {
        const rawsocket = createMock(0);
        const socket = rsock.checkNewConnection(rawsocket);

        socket.on('async', (data) => { assert(data == 'test'); });
        rawsocket.inMsg('async', 'test');

        socket.disconnect();
        assert.throws(function() {
            socket.emit('async', 'test');
        }, Error, 'Connection not cut down');
    });


    it('should fail with zero latency', function() {
        const rawsocket = createMock(0);
        const socket = rsock.checkNewConnection(rawsocket);
        rawsocket.inDisconnect();
        assert(socket.disconnected);
    });

    it('should persist with non-zero latency', function(done) {
        const rawsocket = createMock(0);
        const socket = rsock.checkNewConnection(rawsocket);
        socket.waitTime = 0.01;

        rawsocket.inDisconnect();
        assert(!socket.disconnected);
        setTimeout(() => {
            assert(socket.disconnected);
            done();
        }, 100);
    });

    it('should reconnect', function(done) {
        const rawsocket = createMock(0);
        const socket = rsock.checkNewConnection(rawsocket);
        socket.waitTime = 0.01;

        rawsocket.inDisconnect();
        assert(!socket.disconnected);

        const rawsocket1 = createMock(0);
        const socket2 = rsock.checkNewConnection(rawsocket1);
        assert(socket2 === null);

        setTimeout(() => {
            assert(!socket.disconnected);
            socket.on('async', (data) => { assert(data == 'test'); });
            rawsocket1.inMsg('async', 'test');
            done();
        }, 100);
    });


    it('should not mix', function(done) {
        const rawsocket1 = createMock(1);
        const rawsocket2 = createMock(2);
        const socket1 = rsock.checkNewConnection(rawsocket1);
        const socket2 = rsock.checkNewConnection(rawsocket2);
        assert(socket1 != socket2);
        done();
    });

    it('Reconnect to unbroken socket yields null', function(done) {
        const rawsocket1 = createMock(1);
        const rawsocket2 = createMock(1);
        const socket1 = rsock.checkNewConnection(rawsocket1);
        const socket2 = rsock.checkNewConnection(rawsocket2);
        assert(socket2 === null);
        done();
    });
});
