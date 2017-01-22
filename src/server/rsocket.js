/**
 * Created by whyask37 on 2017. 1. 22..
 */

"use strict";

const _ = require('underscore');
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

    socketTable[this.accessID] = this;

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
    // console.log('Disconnecting socket', this.socket.accessID, this.socket.id);
    this.socket.disconnect();
    delete socketTable[this.accessID];
    this.disconnected = true;
};



RSocket.prototype.initSocketEventHandler = function () {
    const socket = this.socket;
    const this2 = this;
    socket.on('disconnect', function (data) {
        this2.onDisconnect(socket, data);
    });
    socket.on('cmd', function (data) {
        this2.onEvent(this, 'cmd', data);
    });
    socket.on('chat', function (data) {
        this2.onEvent(this, 'chat', data);
    });
};

RSocket.prototype.onEvent = function (socket, event, data) {
    if(socket != this.socket) return;
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

RSocket.prototype.onDisconnect = function (socket, data) {
    const handler = () => {
        if(socket != this.socket) return;
        this.waitTimer = null;
        this.onEvent(socket, 'disconnect', data);
        this.disconnect();
    };

    if(this.waitTime === 0) {
        return handler();
    }
    else {
        this.waitTimer = setTimeout(handler, this.waitTime * 1000);
    }
};

RSocket.prototype.reconnectWithSocket = function (rawSocket) {
    this.socket = rawSocket;
    // console.log('Reconnecting socket', this.socket.accessID, this.socket.id);
    if(this.waitTimer) {
        clearTimeout(this.waitTimer);
        this.waitTimer = null;
    }
    this.initSocketEventHandler();
    return true;
};


///////////////////////////////////



exports.checkNewConnection = function (rawSocket) {
    // console.log('New connection :', rawSocket.accessID);
    // console.log(_.keys(socketTable));
    const oldSocket = socketTable[rawSocket.accessID];
    if(oldSocket) {
        if(oldSocket.reconnectWithSocket(rawSocket)) return null;
    }
    return new RSocket(rawSocket);
};
