/**
 * Created by whyask37 on 2017. 1. 11..
 */


const roomsys = require('./roomlist');
const _ = require('underscore');
const async = require('async');
const cmdproc = require("./io/cmdproc");
const cmdout = require('./io/cmdout');
const cmdcmp = require('./cmdcmp/cmdcmp');
const rSock = require('./rsocket');

exports = module.exports = function(io) {
    "use strict";

    io.use(validateSession);
    io.on('connection', function (socket_) {
        const socket = rSock.checkNewConnection(socket_);
        if(socket) onConnect(socket);
    });
};


/**
 * Cookie validator
 */

function validateSession(socket, next) {
    "use strict";

    let identity = socket.request.user;
    let roomID = socket.handshake.session.roomID;
    let accessID = socket.handshake.session.accessID;

    // signedCookies가 잘못되었을 경우
    if(!identity || !roomID || !accessID) {
        return next(new Error('Invalid access'));
    }

    // roomID가 잘못되었을 경우
    else if(!/[0-9a-zA-Z]{8}/.test(roomID)) {
        return next(new Error('Invalid roomID'));
    }
    socket.username = identity.username;
    socket.useridf = identity.id;
    socket.roomID = roomID;
    socket.accessID = accessID;
    next();
}


/**
 * Process connection ~ room joining
 * @param socket
 */
function onConnect(socket) {
    "use strict";

    global.logger.info(`[Room ${socket.roomID }] User connected : ${socket.username} (${socket.useridf})`);
    socket.emit('info', 'Welcome to openMighty server');

    const roomID = socket.roomID;

    // Create room if nessecary
    let room = roomsys.getRoom(roomID);
    if(!room) roomsys.createRoom(roomID, socket, (err, room_, userEntry) => {
        room = room_;
        afterJoin(err, userEntry);
    });
    else room.addUser(socket, socket.username, socket.useridf, afterJoin);

    function afterJoin(err, userEntry) {
        if (err) {
            socket.emit('err', '룸 입장이 거부되었습니다 : ' + err.message);
            roomsys.gcRoom(socket.roomID);
            return socket.disconnect();
        }

        socket.room = room;
        socket.userEntry = userEntry;
        onRoomJoin(socket);
    }
}

exports.onConnect = onConnect;

/**
 * Process after room joining
 * @param socket
 */
function onRoomJoin(socket) {
    "use strict";

    const room = socket.room;
    const userEntry = socket.userEntry;

    // Process chatting
    socket.on('chat', function(msg) {
        // console.log('chat from ' + socket.useridf + ' : ' + msg);
        room.emit('chat', '[' + socket.username + '] ' + msg);
    });

    // Process disconnection
    socket.on('disconnect', function(){
        global.logger.info(`[Room ${socket.roomID}] User disconnected : ${socket.username} (${socket.useridf})`);
        room.removeUser(socket.useridf, (err) => {});
        cmdout.emitRoomLeft(room, socket.useridf);
        roomsys.gcRoom(socket.roomID);
    });

    // Process commands
    socket.on('cmd', function (msg) {
        if(!msg) return socket.emit('err', '비어있는 명령입니다.');
        msg = cmdcmp.decompressCommand(msg);
        if(!msg || !msg.type) {
            return socket.emit('err', '잘못된 명령입니다.');
        }

        global.logger.debug('[cmd ' + socket.useridf + ']', msg);

        const cmdProcessor = cmdproc[msg.type];
        if(!cmdProcessor) {
            return socket.emit('err', '알 수 없는 명령입니다.');
        }
        return cmdProcessor(socket, room, userEntry, msg);
    });

    // 입장인원 관련
    const users = _.map(room.users, (user) => user.username);
    socket.emit('info', '현재 입장인원 : ' + users.join(', '));
    cmdout.emitRoomJoin(room, userEntry);
    cmdout.emitRoomUsers(room, userEntry);
}


/////////
// utility functions
