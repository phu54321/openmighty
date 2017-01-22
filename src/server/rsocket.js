/**
 * Created by whyask37 on 2017. 1. 22..
 */

"use strict";

const socketTable = {};

/**
 * Reconnectable socket
 * @param socket
 * @constructor
 */
function RSocket(socket) {
    // Public
    this.accessID = socket.accessID;
    this.disconnected = false;
    this.waitTime = 0;

    this.username = socket.username;
    this.useridf = socket.useridf;
    this.roomID = socket.roomID;
    this.accessID = socket.accessID;

    // Internal
    this.evList = {};
    this.socket = socket;
    this.waitTimer = null;

    this.initSocketEventHandler();
}

/**
 * Manual disconnect
 */
RSocket.prototype.disconnect = function () {
    this.socket.disconnect();
    delete socketTable[this.accessID];
    clearTimeout(this.reconnectWaiting);
};



RSocket.prototype.initSocketEventHandler = function () {
    const socket = this.socket;
    socket.on('disconnect', (data) => this.onDisconnect(data));
    socket.on('cmd', (data) => this.onEvent('cmd', data));
    socket.on('chat', (data) => this.onEvent('chat', data));
};

RSocket.prototype.onEvent = function (event, data) {
    if(this.evList[event]) {
        this.evList[event].forEach((evHandler) => {
            evHandler(data);
        });
    }
};

RSocket.prototype.on = function (event, fn) {
    if(!this.evList[event]) this.evList[event] = [];
    this.evList[event].push(fn);
};

RSocket.prototype.emit = function (event, data) {
    this.socket.emit(event, data);
};

RSocket.prototype.onDisconnect = function (data) {
    const handler = () => {
        this.waitTime = null;
        this.onEvent('disconnect', data);
        delete socketTable[this.accessID];
        this.disconnected = true;
    };

    if(this.waitTime === 0) {
        return handler();
    }
    else {
        this.waitTimer = setTimeout(handler, this.waitTime * 1000);
    }
};

///////////////////////////////////




exports.reconnectableSocket = function (socket) {
    return new RSocket(socket);
};
