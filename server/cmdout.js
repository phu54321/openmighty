/**
 * Created by whyask37 on 2017. 1. 12..
 */

const _ = require('underscore');

exports.emitRoominfo = function (room) {
    const users = _.map(room.listUsers(), (user) => user.username);
    room.emit('cmd', 'userList ' + JSON.stringify({
        owner: room.getOwnerIndex(),
        users: users
    }));
};

