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

MockSocket.prototype.msgin = function (event, data) {
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



///////////////

describe('MockSocket', function() {
    describe('#connect()', function() {
        it('should initiate new connection', function(done) {
            const socket = new MockSocket();
            socket.on('cmd', console.log);
            socket.on('async', (data) => {
                assert(data == 'test');
                done();
            });
            socket.msgin('async', 'test');
        });
    });

    describe('#disconnect()', function() {
        it('should cut down any transmission', function(done) {
            const socket = new MockSocket();
            socket.disconnect();
            assert.throws(function() {
                socket.msgin('async', 'test');
            }, Error, 'Connection not cut down');
            done();
        });
    });
});
