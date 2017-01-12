/**
 * Created by whyask37 on 2017. 1. 11..
 */

const MightyGame = require('./mighty');
const _ = require('underscore');
const async = require('async');

let roomMap = {};


/**
 * Get room from room ID
 * @param roomID
 * @returns {*}
 */
function getRoom(roomID) {
    return roomMap[roomID];
}

/**
 * Remove room if it should be.
 */

function gcRoom(roomID) {
    const room = getRoom(roomID);
    if(room && room.isEmpty()) {
        console.log('Room ' + roomID + ' empty : removing');
        delete roomMap[roomID];
    }
}

module.exports = function(io) {
    io.use(validateCookie);

    // Add connection handler
    io.on('connection', onConnect);
};


/**
 * Cookie validator
 */
function validateCookie(socket, next) {
    let identity = socket.request.signedCookies.identity;
    let roomID = socket.request.signedCookies.roomID;

    // signedCookies가 잘못되었을 경우
    if(!identity || !roomID) {
        return next(new Error('Invalid access'));
    }

    // roomID가 잘못되었을 경우
    else if(!/[0-9a-zA-Z]{8}/.test(roomID)) {
        return next(new Error('Invalid roomID'));
    }
    identity = JSON.parse(identity);
    socket.username = identity.username;
    socket.useridf = identity.useridf;
    socket.roomID = roomID;
    next();
}


/**
 * Process connection ~ room joining
 * @param socket
 */
function onConnect(socket) {
    console.log('[Room ' + socket.roomID + '] user connected : ' + socket.useridf);
    socket.emit('info', 'Welcome to openMighty server');

    const roomID = socket.roomID;

    // Create room if nessecary
    let room = roomMap[roomID];
    if(!room) room = roomMap[roomID] = new MightyGame(roomID, socket.useridf);

    room.addUser(socket, socket.username, socket.useridf, (err, userEntry) => {
        if (err) {
            socket.emit('info', '룸 입장이 거부되었습니다 : ' + err.message);
            gcRoom(socket.roomID);
            return socket.disconnect();
        }

        socket.userEntry = userEntry;

        const users = _.map(room.listUsers(), (user) => user.username);
        socket.emit('info', '현재 입장인원 : ' + users.join(', '));
        socket.emit('cmd', 'userList ' + JSON.stringify({
            owner: room.getOwnerIndex(),
            users: users
        }));

        onRoomJoin(socket);
    });
}


/**
 * Process after room joining
 * @param socket
 */
function onRoomJoin(socket) {
    const room = getRoom(socket.roomID);
    const userEntry = socket.userEntry;

    // Process chatting
    socket.on('chat', function(msg) {
        const users = room.listUsers();
        _.map(users, (user) => {
            user.socket.emit('chat', '[' + socket.username + '] ' + msg);
        });
    });

    // Process disconnection
    socket.on('disconnect', function(){
        console.log('user disconnected : ' + socket.useridf);
        room.removeUser(socket.useridf, (err) => {});
        gcRoom(socket.roomID);
    });
}
