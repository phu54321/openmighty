/**
 * Created by whyask37 on 2017. 1. 11..
 */

function generateRandomID(length) {
    var text = "";
    var charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for(var i = 0; i < length; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

function enableRoomURLValidator() {
    var pattern = window.location.origin + '/[a-zA-Z0-9]{8}|';
    $('#roomURL').attr('pattern', pattern);
}

function enterRoom() {
    var roomURL = $('#roomURL').val();
    if(roomURL === '') {
        var randomID = generateRandomID(8);
        roomURL = window.location.origin + "/" + randomID;
        $('#roomURL').val(roomURL);
    }
    window.location.href = roomURL;
}
