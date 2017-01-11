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
    let room = roomMap[roomID];
    if(!room) {
        room = roomMap[roomID] = new MightyGame();
    }
    return room;
}

module.exports = function(io) {
    io.use(validateCookie);

    // Add connection handler
    io.on('connection', function(socket) {
        console.log('[Room ' + socket.roomID + '] user connected : ' + socket.useridf);
        socket.emit('info', 'Welcome to openMighty server');

        const room = getRoom(socket.roomID);
        room.addUser(socket, socket.username, socket.useridf, function(err, userEntry) {
            if (err) {
                io.emit('info', '룸 입장이 거부되었습니다 : ' + err.message);
                if (room.isEmpty()) delete roomMap[socket.roomID];
                return socket.disconnect();
            }

            // Show user list
            {
                const users = _.map(room.listUsers(), (user) => user.username);                io.emit('info', '현재 입장인원 : ' + users.join(', '));
                io.emit('cmd', 'userList ' + JSON.stringify(users));
            }

            // Process chatting
            socket.on('chat', function(msg) {
                const users = room.listUsers();
                _.map(users, (user) => {
                    user.socket.emit('chat', '[' + socket.username + '] ' + msg);
                });
            });

            // Process disconnection
            socket.on('disconnect', function(){
                console.log('user disconnected');
                room.removeUser(socket.useridf, (err) => {});
                if(room.isEmpty()) {
                    console.log('Room ' + socket.roomID + ' empty : removing');
                    delete roomMap[socket.roomID];
                }
            });

        });

    });
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