"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
        success: function success(data) {
            window.location.reload(true);
        },
        error: function error(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, 'message : ' + jqXHR.responseText + '\nerror : ' + errorThrown);
        }
    });
}

//////////


function formVerifier_AlwaysAllow(value) {
    return true;
}

function formVerifier_NoBlank(value) {
    return value !== '';
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
        var _nameTable$i = _slicedToArray(nameTable[i], 4),
            inputName = _nameTable$i[0],
            postName = _nameTable$i[1],
            formVerifier = _nameTable$i[2],
            errorMsg = _nameTable$i[3];

        if (!formVerifier) formVerifier = formVerifier_AlwaysAllow;
        if (!errorMsg) errorMsg = "허용되지 않은 입력입니다.";

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
        success: function success(data) {
            if (!data.error) {
                callback(data);
            } else {
                // Re-enable form to allow correction.
                targetForm.find('input, textarea').prop('disabled', false);
                window.alert(data.error);
            }
        },
        error: function error(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, 'message : ' + jqXHR.responseText + '\nerror : ' + errorThrown);
        }
    });
    return true;
}
'use strict';

/**
 * Created by whyask37 on 2017. 1. 11..
 */

var socket = void 0;

function initSockets() {
    socket = io();

    socket.on('err', function (msg) {
        Materialize.toast(msg, 4000);
    });

    socket.on('info', function (msg) {
        "use strict";

        console.log('info', msg);
    });

    socket.on('cmd', function (msg) {
        "use strict";

        console.log('cmd', msg);
        translateCmdMessage(msg);
    });

    socket.on('disconnect', function () {
        "use strict";
        // alert('서버와의 연결이 끊겼습니다.');
    });
}

function sendCmd(type, object) {
    "use strict";

    var copy = Object.assign({}, object || {});
    copy.type = type;
    socket.emit('cmd', copy);
    return true;
}

////


var cmdTranslatorMap = {};
var room = {
    playing: false,
    myidf: null,
    owner: 0,
    users: []
};

function viewRoom() {
    "use strict";

    var users = void 0,
        owner = void 0,
        president = void 0;
    if (!room.playing) {
        owner = room.owner;
        users = room.users;
        president = -1;
    } else {
        owner = -1;
        users = game.gameUsers;
        president = game.president;
    }

    var $playerSlots = $('.player-slot');
    for (var i = 0; i < users.length; i++) {
        var $playerSlot = $($playerSlots[i]);
        var user = users[i];
        $playerSlot.attr('useridf', user.useridf);
        $playerSlot.find('.player-name').text(user.username);
        $playerSlot.removeClass('player-empty');

        if (owner === i) $playerSlot.addClass('player-owner');else if (president === i) $playerSlot.addClass('player-president');

        if (user.useridf == room.myidf) $playerSlot.addClass('player-self');else $playerSlot.removeClass('player-self');
    }

    for (var _i = users.length; _i < 5; _i++) {
        var _$playerSlot = $($playerSlots[_i]);
        _$playerSlot.removeAttr('useridf');
        _$playerSlot.find('.player-name').text("Empty");
        _$playerSlot.addClass('player-empty');
        _$playerSlot.removeClass('player-owner');
    }
}

function getSelfSlot() {
    "use strict";

    return $('.player-slot.player-self');
}

function translateCmdMessage(msg) {
    "use strict";

    if (cmdTranslatorMap[msg.type]) cmdTranslatorMap[msg.type](msg);else Materialize.toast('Unknown command message type : ' + msg.type, 5000);
}

///////////////////////////////////

// Room users

cmdTranslatorMap.rjoin = function (msg) {
    "use strict";

    Materialize.toast(msg.username + '님이 입장하셨습니다.', 4000);
    room.users.push({
        username: msg.username,
        useridf: msg.useridf
    });
    viewRoom();
};

cmdTranslatorMap.rleft = function (msg) {
    "use strict";

    for (var i = 0; i < room.users.length; i++) {
        var user = room.users[i];
        if (user.useridf == msg.useridf) {
            Materialize.toast(user.username + '님이 퇴장하셨습니다.', 4000);
            room.users = room.users.splice(i, 1);
        }
    }
    room.owner = msg.owner;
    viewRoom();
};

cmdTranslatorMap.rusers = function (msg) {
    "use strict";

    room.owner = msg.owner;
    room.users = msg.users;
    room.myidf = msg.youridf;
    viewRoom();
};

///////////////////////////////////

// Game init

var game = {};

function viewDeck() {
    var $playerDeck = $('.deck');
    $playerDeck.find('.deck-card-container').remove();

    for (var i = 0; i < game.deck.length; i++) {
        var card = game.deck[i];
        var _ref = [card.shape, card.num],
            shape = _ref[0],
            num = _ref[1];


        var $deckCardContainer = $('<div/>').addClass('deck-card-container');
        var $deckCard = $('<div/>').addClass('deck-card game-card-container');
        var $gameCard = $('<div/>').addClass('game-card game-card-' + shape[0] + num);
        $deckCard.append($gameCard);
        $deckCardContainer.append($deckCard);
        $playerDeck.append($deckCardContainer);
    }
}

cmdTranslatorMap.gusers = function (msg) {
    "use strict";

    game.gameUsers = msg.users;
    game.president = -1;
    room.playing = true;
    viewRoom();
};

cmdTranslatorMap.pbinfo = function (msg) {
    "use strict";

    var bidder = msg.bidder;
    var $playerSlot = $($('.player-slot')[bidder]);
    var $playerCardContainer = $playerSlot.find('.game-card-container');

    game.bidShape = msg.bidShape;
    game.bidCount = msg.bidCount;

    $playerCardContainer.find('.game-card').remove();
    var $biddingInfo = $('<div/>').addClass('game-card player-card-bidding');
    if (msg.bidShape == 'pass') {
        $biddingInfo.text("pass");
    } else {
        $biddingInfo.text(msg.bidShape + ' ' + msg.bidCount);
    }
    $playerCardContainer.append($biddingInfo);
};

cmdTranslatorMap.bidrq = function () {
    "use strict";

    var $selfPlayerSlot = getSelfSlot();
    var $playerCardContainer = $selfPlayerSlot.find('.game-card-container');

    var bidCount = game.bidCount || 13;
    if (game.bidShape == 'none') bidCount++;

    $playerCardContainer.html('\n<form id=\'bidForm\' action="javascript:sendBid();" class="game-card player-bid-form">\n    <div class="player-bid-form-title">\uACF5\uC57D</div>\n    <select name="bidShape" class="browser-default">\n        <option value="pass" selected="">\uD328\uC2A4</option>\n        <option value="spade">\uC0BD (\uC2A4\uD398\uC774\uB4DC)</option>\n        <option value="heart">\uD2B8 (\uD558\uD2B8)</option>\n        <option value="diamond">\uB2E4\uB9AC (\uB2E4\uC774\uC544\uBAAC\uB4DC)</option>\n        <option value="clover">\uB04C (\uD074\uB85C\uBC84)</option>\n        <option value="none">\uB178 (\uB178\uAE30\uB8E8\uB2E4)</option>\n    </select>\n    <span class="range-field">\n        <input type="range" name="bidCount" min="' + bidCount + '" max="20" value="' + bidCount + '">\n    </span>\n    <button type="submit" class="btn waves-effect waves-light">\uACF5\uC57D</button>\n</form>\n');
};

function sendBid() {
    "use strict";

    var $bidForm = $('#bidForm');
    var bidShape = $bidForm.find('*[name="bidShape"]').val();
    var bidCount = $bidForm.find('*[name="bidCount"]').val();
    sendCmd('bid', {
        shape: bidShape,
        num: parseInt(bidCount)
    });
    return false;
}

cmdTranslatorMap.deck = function (msg) {
    "use strict";

    game.deck = msg.deck;
    viewDeck();
};
/**
 * Created by whyask37 on 2017. 1. 11..
 */

"use strict";

function generateRandomID(length) {
    var text = "";
    var charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < length; i++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }return text;
}

function enableRoomURLValidator() {
    var pattern = window.location.origin + '/[a-zA-Z0-9]{8}|';
    $('#roomURL').attr('pattern', pattern);
}

function enterRoom() {
    var $roomURL = $('#roomURL');
    var roomURL = $roomURL.val();
    if (roomURL === '') {
        var randomID = generateRandomID(8);
        roomURL = window.location.origin + "/" + randomID;
        $roomURL.val(roomURL);
    }
    window.location.href = roomURL;
}
//# sourceMappingURL=app.js.map
