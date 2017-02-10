/**
 * Created by whyask37 on 2017. 2. 10..
 */

const assert = require('assert');
require('../logger');

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

module.exports = MockSocket;
