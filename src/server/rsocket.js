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
    console.log("RSocket with", socket.accessID);

    this.evList = {};
    this.socket = socket;
    this.accessID = socket.accessID;
    this.waitTime = 60;
    this.reconnectWaiting = false;

    this.username = socket.username;
    this.useridf = socket.useridf;
    this.roomID = socket.roomID;
    this.accessID = socket.accessID;

    socketTable[this.accessID] = this;

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
    const this2 = this;
    socket.on('connection', function(data) {
        console.log('[onConnection]', this2.accessID, socket.id);
        this2.onEvent('connection', data);
    });

    socket.on('disconnect', function(data) {
        this2.onDisconnect(data);
    });
    socket.on('cmd', (data) => this.onEvent('cmd', data));
    socket.on('chat', (data) => this.onEvent('chat', data));
};

RSocket.prototype.onEvent = function (event, data) {
    console.log(event);
    if(this.evList[event]) this.evList[event](data);
};

RSocket.prototype.on = function (event, fn) {
    this.evList[event] = fn;
};

RSocket.prototype.emit = function (event, data) {
    this.socket.emit(event, data);
};


RSocket.prototype.onDisconnect = function (data) {
    console.log('disconnect');

    const disconnect = () => {
        this.onEvent('disconnect', data);
        delete socketTable[this.accessID];
    };

    if(this.waitTime === 0) {
        return disconnect();
    }
    else {
        this.reconnectWaiting = setTimeout(disconnect, this.waitTime * 1000);
    }
};

RSocket.prototype.reconnectWithSocket = function (socket) {
    console.log('reconnectWithSocket', this.reconnectWaiting);
    if(!this.reconnectWaiting) return false;
    clearTimeout(this.reconnectWaiting);
    if(this.socket != socket) {
        this.socket = socket;
        this.initSocketEventHandler();
    }
};
///////////////////////////////////




exports.reconnectableSocket = function (socket) {
    if(socketTable[socket.accessID]) {
        const rsock = socketTable[socket.accessID];
        if(rsock.reconnectWaiting) {
            if(rsock.reconnectWithSocket(socket)) return rsock;
        }
    }
    return new RSocket(socket);
};
