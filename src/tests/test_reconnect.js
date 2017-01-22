/**
 * Created by whyask37 on 2017. 1. 22..
 */

"use strict";

const assert = require('assert');


////


function MockSocket() {
    this.evHandler = {};
    this.disconnected = false;
}

MockSocket.prototype.on = function (event, eventHandler) {
    if(!this.evHandler[event]) {
        this.evHandler[event] = [];
    }
    this.evHandler[event].push(eventHandler);
};

MockSocket.prototype.emit = function (event, data) {
    assert(!this.disconnected);
    // console.log('[MockSocket Out]', event, data);
};

MockSocket.prototype.inMsg = function (event, data) {
    // console.log('[MockSocket In]', event, data);
    assert(!this.disconnected);

    if(this.evHandler[event]) {
        this.evHandler[event].forEach((evHandler) => {
            evHandler(data);
        });
    }
    if(event == 'disconnect') {
        this.disconnected = true;
    }
};

MockSocket.prototype.disconnect = function () {
    this.disconnected = true;
};

MockSocket.prototype.inDisconnect = function() {
    this.inMsg('disconnect');
    this.disconnected = true;
};

///////////////

describe('MockSocket', function() {
    describe('#disconnect()', function() {
        it('should cut down any transmission', function(done) {
            const socket = new MockSocket();
            socket.disconnect();
            assert.throws(function() {
                socket.inMsg('async', 'test');
            }, Error, 'Connection not cut down');
            assert.throws(function() {
                socket.emit('cmd', 'out');
            }, Error, 'Connection not cut down');
            done();
        });
    });

    describe('#on()', function() {
        it('should register hander', function (done) {
            const socket = new MockSocket();
            socket.on('async', (data) => {
                assert(data == 'test');
                done();
            });
            socket.inMsg('async', 'test');
        });
        it('should handle multiple handlers', function (done) {
            const socket = new MockSocket();
            let flag = false;
            socket.on('async', (data) => {
                assert(!flag && data == 'test');
                flag = true;
            });
            socket.on('async', (data) => {
                assert(flag && data == 'test');
                done();
            });
            socket.inMsg('async', 'test');
        })
    });
});


/////////////////////////////////////////////////////

const rsock = require('../server/rsocket');

function createMock(userIndex, accessID) {
    const socket = new MockSocket();
    socket.username = 'testuser' + userIndex;
    socket.useridf = 'useridf' + userIndex;
    socket.roomID = 'room0001';
    socket.accessID = 'accessID' + accessID;
    return socket;
}

describe('RSocket', function() {
    it('should act as normal socket', function() {
        const rawsocket = createMock(0, 0);
        const socket = rsock.reconnectableSocket(rawsocket);

        socket.on('async', (data) => { assert(data == 'test'); });
        rawsocket.inMsg('async', 'test');

        socket.disconnect();
        assert.throws(function() {
            socket.emit('async', 'test');
        }, Error, 'Connection not cut down');
    });


    it('should fail with zero latency', function() {
        const rawsocket = createMock(0, 0);
        const socket = rsock.reconnectableSocket(rawsocket);
        rawsocket.inDisconnect();
        assert(socket.disconnected);
    });
});
