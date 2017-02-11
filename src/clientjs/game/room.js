/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";

const game = require('./game');
const room = {
    playing: false,
    myidf: null,
    owner: 0,
    users: []
};
const sendcmd = require('./sendCmd');
const template = require('./template');


exports = module.exports = room;

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
    $playerSlots.removeClass('player-empty player-owner player-president player-self player-ai player-leading');

    let self = null;

    $playerSlots.find('.player-has').empty();
    $('.last-trick').empty();

    for(let i = 0 ; i < users.length ; i++) {
        const $playerSlot = $($playerSlots[i]);
        const user = users[i];
        $playerSlot.find('.player-name').text(user.username + ' (' + user.rating.toFixed(1) + ')');
        $playerSlot.find('.game-card-container').empty();

        if(owner === i) $playerSlot.addClass('player-owner');
        if(president === i) $playerSlot.addClass('player-president');
        if(user.useridf == room.myidf) {
            $playerSlot.addClass('player-self');
            self = i;
        }
    }

    for(let i = users.length ; i < 5 ; i++) {
        const $playerSlot = $($playerSlots[i]);
        $playerSlot.addClass('player-empty');
        $playerSlot.find('.player-name').text("Empty");
        $playerSlot.find('.game-card-container').empty();
    }


    if(!room.playing) {
        if (owner === self) {
            addStartButton();
        }
    }
    else {
        game.selfIndex = self;
    }
};


function addStartButton() {
    const $gameCardContainer = $('.player-self').find('.game-card-container');
    template($gameCardContainer, 'button').focus();
    $gameCardContainer.find('button').click(function(e) {
        sendcmd.sendStartGame();
        $('.player-has').empty();
        e.preventDefault();
    });
}

window.onbeforeunload = function (e) {
    if(room.playing) {
        e = e || window.event;
        const msg = '게임 중에 퇴장하면 중간에 다시 들어오실 수 없습니다. 나가시겠습니까?';
        if (e) e.returnValue = msg;
        return msg;
    }
};
