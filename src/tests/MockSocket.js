/**
 * Created by whyask37 on 2017. 2. 10..
 */

"use strict";


const assert = require('assert');
require('../logger');

/**
 * Simulate server-side socket
 * @param userID
 * @param roomID
 * @param accessID
 * @constructor
 */
function MockSocket(userID, roomID, accessID) {
    this.msgInHandler = {};
    this.msgOutHandler = {};

    this.disconnected = false;
    this.username = 'test_' + userID;
    this.useridf = accessID;
    this.roomID = 'room' + ("0000" + roomID).substr(-4);
    this.accessID = accessID;
}

/**
 * Set event handler when server gets command
 */
MockSocket.prototype.on = function (event, eventHandler) {
    this.msgInHandler[event] = eventHandler;
};

/**
 * Called when server emits some command
 */
MockSocket.prototype.emit = function (event, data) {
    assert(!this.disconnected);
    // console.log('[MockSocket Out]', event, data);

    if(this.msgOutHandler[event]) this.msgOutHandler[event].apply(this, [data]);
};

/**
 * Called when server gets some message
 */
MockSocket.prototype.inMsg = function (event, data) {
    // console.log('[MockSocket In]', event, data);
    assert(!this.disconnected);

    if(this.msgInHandler[event]) this.msgInHandler[event].apply(this, [data]);
    if(event == 'disconnect') {
        this.disconnected = true;
    }
};

/**
 * Register msg out handler
 */
MockSocket.prototype.onEmit = function (event, eventHandler) {
    this.msgOutHandler[event] = eventHandler;
};

/**
 * Server disconnects socket
 */
MockSocket.prototype.disconnect = function () {
    this.disconnected = true;
};

/**
 * Client issued disconnection.
 */
MockSocket.prototype.inDisconnect = function() {
    this.inMsg('disconnect');
    this.disconnected = true;
};

module.exports = MockSocket;
