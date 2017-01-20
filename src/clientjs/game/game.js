/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";

const room = {
    playing: false,
    myidf: null,
    owner: 0,
    users: []
};

const game = {};

exports.room = room;
exports.game = game;

exports.viewRoom = function () {
    let users, owner, president;
    if(!room.playing) {
        owner = room.owner;
        users = room.users;
        president = -1;
    }
    else {
        owner = -1;
        users = game.gameUsers;
        president = game.president;
    }

    const $playerSlots = $('.player-slot');
    $playerSlots.removeClass('player-owner player-president player-self');

    for(let i = 0 ; i < users.length ; i++) {
        const $playerSlot = $($playerSlots[i]);
        const user = users[i];
        $playerSlot.find('.player-name').text(user.username);

        if(owner === i) $playerSlot.addClass('player-owner');
        if(president === i) $playerSlot.addClass('player-president');
        if(user.useridf == room.myidf) $playerSlot.addClass('player-self');
    }

    for(let i = users.length ; i < 5 ; i++) {
        const $playerSlot = $($playerSlots[i]);
        $playerSlot.find('.player-name').text("Empty");
    }
};
