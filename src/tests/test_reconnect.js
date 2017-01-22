/**
 * Created by whyask37 on 2017. 1. 22..
 */

"use strict";

function MockSocket() {
    this.evHandler = {};
}

MockSocket.prototype.on = function (event, eventHandler) {
    this.evHandler[event] = eventHandler;
};

MockSocket.prototype.emit = function (event, data) {
    console.log('[MockSocket Out]', event, data);
};

MockSocket.prototype.in = function (event, data) {
    console.log('[MockSocket In]', event, data);
    process.nextTick(() => {
        this.evHandler[event](data);
    });
};

MockSocket.prototype.disconnect = function () {
    this.emit('disconnect');
};



///////////////

suite('Reconnectable socket');

test('MockSocket test', function() {
    const socket = new MockSocket();
    socket.on('cmd', console.log);
    socket.emit('test');
    socket.in('async', 'test');
    socket.on('async', (data) => {
        console.log(data);
    })
});
