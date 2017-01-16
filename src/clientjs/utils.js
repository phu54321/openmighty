/**
 * Created by whyask37 on 2017. 1. 11..
 */

"use strict";

function generateRandomID(length) {
    let text = "";
    const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for(let i = 0; i < length; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

function enableRoomURLValidator() {
    const pattern = window.location.origin + '/[a-zA-Z0-9]{8}|';
    $('#roomURL').attr('pattern', pattern);
}

function enterRoom() {
    const $roomURL = $('#roomURL');
    let roomURL = $roomURL.val();
    if(roomURL === '') {
        const randomID = generateRandomID(8);
        roomURL = window.location.origin + "/" + randomID;
        $roomURL.val(roomURL);
    }
    window.location.href = roomURL;
}
