/**
 * Created by whyask37 on 2017. 1. 12..
 */

const MightyGame = require('./logic/mighty');


let roomMap = {};


/**
 * Get room from room ID
 * @param roomID
 * @returns {*}
 */
function getRoom(roomID) {
    "use strict";
    return roomMap[roomID];
}

exports.getRoom = getRoom;


/**
 * Remove room if it should be.
 */

function gcRoom(roomID) {
    "use strict";
    const room = getRoom(roomID);
    if(room && room.hasNoUser()) {
        // console.log('Room ' + roomID + ' empty : removing');
        delete roomMap[roomID];
    }
}

exports.gcRoom = gcRoom;


/**
 * Create room
 */
function createRoom(roomID, socket, cb) {
    "use strict";
    if(getRoom(roomID)) return cb(new Error('이미 있는 방 번호입니다.'));
    const room = roomMap[roomID] = new MightyGame(roomID, socket.useridf);
    room.addUser(socket, socket.username, socket.useridf, (err, userEntry) => {
        if(err) return cb(err);
        return cb(null, room, userEntry);
    });
}

exports.createRoom = createRoom;
