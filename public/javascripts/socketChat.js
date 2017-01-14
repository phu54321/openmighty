/**
 * Created by whyask37 on 2017. 1. 11..
 */

var socket = io();

function addMessage(cls, msg) {
    var li = $('<li></li>').addClass(cls).text(msg);
    $('#messages').append(li);
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
}

socket.on('info', function(msg) {
    addMessage('chat-info', msg);
});

socket.on('err', function(msg) {
    addMessage('chat-err', msg);
});

socket.on('cmd', function(msg) {
    addMessage('chat-cmd', JSON.stringify(msg, null, 4));
});

socket.on('chat', function(msg) {
    addMessage('chat-chat', msg);
});

socket.on('disconnect', function() {
    "use strict";
    // alert('서버와의 연결이 끊겼습니다.');
});



function sendChat() {
    var chatMessage = $('#myMessage').val();
    $('#myMessage').val('');
    if(translateChatMessage(chatMessage)) {
        addMessage('chat-cmdin', chatMessage);
        return false;
    }
    socket.emit('chat', chatMessage);
    return false;
}




function sendCmd(type, object) {
    "use strict";

    var copy = Object.assign({}, object || {});
    copy.type = type;
    socket.emit('cmd', copy);
    return true;
}

function translateChatMessage(chatMessage) {
    "use strict";

    var matches, shape, count;

    if(chatMessage == 'start') return sendCmd('start');
    if(chatMessage == 'bid pass') return sendCmd('bid', {shape: 'pass'});
    if(chatMessage.startsWith('bid ')) {
        matches = chatMessage.match(/^bid (\w+) (\d+)$/);
        if(matches) {
            shape = matches[1];
            count = parseInt(matches[2]);
            return sendCmd('bid', {shape: shape, num: count});
        }
    }
    if(chatMessage == 'bidch1 pass') return sendCmd('bidch1', {shape: 'pass'});
    if(chatMessage.startsWith('bidch1')) {
        matches = chatMessage.match(/^bidch1 (\w+) (\d+)$/);
        if(matches) {
            shape = matches[1];
            count = parseInt(matches[2]);
            return sendCmd('bidch1', {shape: shape, num: count});
        }
    }
    if(chatMessage.startsWith('discard3 ')) {
        matches = chatMessage.match(/^discard3 (\d+) (\d+) (\d+)$/);
        if(matches) {
            var cards = [
                parseInt(matches[1]),
                parseInt(matches[2]),
                parseInt(matches[3]),
            ];
            return sendCmd('discard3', {cards: cards});
        }
    }

    if(chatMessage.startsWith('fsel card ')) {
        matches = chatMessage.match(/^fsel card (\d+)$/);
        if(matches) {
            var card = parseInt(matches[1]);
            return sendCmd('fsel', {ftype: 'card', card: card});
        }
    }

    if(chatMessage.startsWith('cplay ')) {
        matches = chatMessage.match(/^play (\d+)$/);
        if(matches) {
            var cardIdx = parseInt(matches[2]);
            return sendCmd('cplay', {cardIdx: cardIdx});
        }
    }
}
