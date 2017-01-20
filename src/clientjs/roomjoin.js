/**
 * Created by whyask37 on 2017. 1. 11..
 */

"use strict";

// 게임 시작시 할 일들입니다.
$(function () {
    /**
     * 특정 길이의 랜덤 alphanumeric 스트링을 만든다.
     */

    function generateRandomID(length) {
        let text = "";
        const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for(let i = 0; i < length; i++ )
            text += charset.charAt(Math.floor(Math.random() * charset.length));

        return text;
    }

    // RoomURL의 패턴을 설정합니다.
    $('#roomURL').attr(
        'pattern',
        '^' + location.origin + '/[a-zA-Z0-9]{8}|$');

    $('#joinRoom').submit(function (e) {
        const $roomURL = $('#roomURL');
        let roomURL = $roomURL.val();
        if (roomURL === '') {
            const randomID = generateRandomID(8);
            roomURL = window.location.origin + "/" + randomID;
            $roomURL.val(roomURL);
        }
        window.location.href = roomURL;

        e.preventDefault();
    });
});
