function formVerifier_AlwaysAllow(value) {
    'use strict';

    return true;
}

function formVerifier_NoBlank(value) {
    'use strict';

    return value !== '';
}

function formVerifier_Email(value) {
    'use strict';

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
}

/**
 * Form의 내용을 종합해 Ajax request를 전송합니다. 이 때 form의 input를 임시로 모두 disable시킵니다
 * @param url - ajax를 날릴 URL
 * @param formName - form의 아이디
 * @param nameTable - ajax의 파라미터 정의. 아래 형식 배열의 배열로 되어있다.
 *      [(form 내 name), (ajax 파라미터 이름), formVerifier, (verifier 실패시 메세지)]
 * @param callback(data) - ajax에서 error가 없을 때 낼 동작
 * @returns {boolean} - ajax가 제대로 보내졌는지
 */
function issueForm(url, formName, nameTable, callback) {
    'use strict';

    var targetForm = $('#' + formName);
    var ajaxData = {};

    if (!targetForm) {
        console.log('Unknown form \'' + formName + '\'');
        return false;
    }

    // Collect form values
    for (var i = 0; i < nameTable.length; i++) {
        var nameTableEntry = nameTable[i];

        var inputName = nameTableEntry[0];
        var postName = nameTableEntry[1];
        var formVerifier = nameTableEntry[2] || formVerifier_AlwaysAllow;
        var errorMsg = nameTableEntry[3] || "허용되지 않은 입력입니다.";

        ajaxData[postName] = targetForm.find('#' + inputName).val();
        if (!formVerifier(ajaxData[postName])) {
            window.alert(errorMsg);
            return false;
        }
    }

    // Disable form temporarilly
    targetForm.find('input, textarea').prop('disabled', true);

    $.ajax({
        type: 'POST',
        url: url,
        data: ajaxData,
        dataType: 'json',
        success: function (data) {
            if (!data.error) {
                callback(data);
            } else {
                // Re-enable form to allow correction.
                targetForm.find('input, textarea').prop('disabled', false);
                window.alert(data.error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, 'message : ' + jqXHR.responseText + '\nerror : ' + errorThrown);
        }
    });
    return true;
}

/////////////////////


function issueRegister() {
    'use strict';

    issueForm('/users/register', 'registerForm', [['username', 'username', formVerifier_NoBlank, '이름을 입력하세요.'], ['useridf', 'useridf', formVerifier_AlwaysAllow, '']], function () {
        window.location.reload(true);
    });
}

function issueLogout() {
    $.ajax({
        type: 'POST',
        url: '/users/logout',
        success: function (data) {
            window.location.reload(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, 'message : ' + jqXHR.responseText + '\nerror : ' + errorThrown);
        }
    });
}
/**
 * Created by whyask37 on 2017. 1. 11..
 */

const socket = io();
const $messages = $('#messages');

function addMessage(cls, msg) {
    const li = $('<li></li>').addClass(cls).text(msg);
    $messages.append(li);
    $messages.scrollTop($messages[0].scrollHeight);
}

socket.on('info', function (msg) {
    addMessage('chat-info', msg);
});

socket.on('err', function (msg) {
    addMessage('chat-err', msg);
});

socket.on('cmd', function (msg) {
    addMessage('chat-cmd', JSON.stringify(msg, null, 4));
});

socket.on('chat', function (msg) {
    addMessage('chat-chat', msg);
});

socket.on('disconnect', function () {
    "use strict";
    // alert('서버와의 연결이 끊겼습니다.');
});

function sendChat() {
    var chatMessage = $('#myMessage').val();
    $('#myMessage').val('');
    if (translateChatMessage(chatMessage)) {
        addMessage('chat-cmdin', chatMessage);
        return false;
    }
    socket.emit('chat', chatMessage);
    return false;
}

function sendCmd(type, object) {
    "use strict";

    const copy = Object.assign({}, object || {});
    copy.type = type;
    socket.emit('cmd', copy);
    return true;
}

function translateChatMessage(chatMessage) {
    "use strict";

    var matches, shape, num, cardIdxs, count, cardIdx;
    var bidShape, bidCount;

    if (chatMessage == 'start') return sendCmd('start');
    if (chatMessage == 'bid pass') return sendCmd('bid', { shape: 'pass' });
    if (chatMessage.startsWith('bid ')) {
        matches = chatMessage.match(/^bid (\w+) (\d+)$/);
        if (matches) {
            shape = matches[1];
            count = parseInt(matches[2]);
            return sendCmd('bid', { shape: shape, num: count });
        }
    }
    if (chatMessage == 'bidch1 pass') return sendCmd('bc1', { shape: 'pass' });
    if (chatMessage.startsWith('bidch1')) {
        matches = chatMessage.match(/^bidch1 (\w+) (\d+)$/);
        if (matches) {
            shape = matches[1];
            count = parseInt(matches[2]);
            return sendCmd('bc1', { shape: shape, num: count });
        }
    }
    if (chatMessage.startsWith('discard3 ')) {
        matches = chatMessage.match(/^discard3 (\d+) (\d+) (\d+)$/);
        if (matches) {
            cardIdxs = [parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3])];
            return sendCmd('d3', { cards: cardIdxs });
        }
    }

    if (chatMessage.startsWith('fsel card ')) {
        matches = chatMessage.match(/^fsel card (\w+) (\d+|)$/);
        if (matches) {
            shape = matches[1];
            num = parseInt(matches[2]) || 0;
            return sendCmd('fs', {
                ftype: 'card',
                shape: shape,
                num: num
            });
        }

        matches = chatMessage.match(/^fsel card (\w+) (\d+|) bch (\w+) (\d+)$/);
        if (matches) {
            shape = matches[1];
            num = parseInt(matches[2]) || 0;
            bidShape = matches[3];
            bidCount = parseInt(matches[4]);

            return sendCmd('fs', {
                ftype: 'card',
                shape: shape,
                num: num,
                bidch2: {
                    bidShape: bidShape,
                    bidCount: bidCount
                }
            });
        }
    }

    if (chatMessage.startsWith('cplay ')) {
        matches = chatMessage.match(/^cplay (\d+)$/);
        if (matches) {
            cardIdx = parseInt(matches[1]);
            return sendCmd('cp', { cardIdx: cardIdx });
        }

        matches = chatMessage.match(/^cplay (\d+) jcall$/);
        if (matches) {
            cardIdx = parseInt(matches[1]);
            return sendCmd('cp', { cardIdx: cardIdx, jcall: true });
        }
    }
}
/**
 * Created by whyask37 on 2017. 1. 11..
 */

function generateRandomID(length) {
    var text = "";
    var charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < length; i++) text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

function enableRoomURLValidator() {
    var pattern = window.location.origin + '/[a-zA-Z0-9]{8}|';
    $('#roomURL').attr('pattern', pattern);
}

function enterRoom() {
    var roomURL = $('#roomURL').val();
    if (roomURL === '') {
        var randomID = generateRandomID(8);
        roomURL = window.location.origin + "/" + randomID;
        $('#roomURL').val(roomURL);
    }
    window.location.href = roomURL;
}
//# sourceMappingURL=app.js.map
