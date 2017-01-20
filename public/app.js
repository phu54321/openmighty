/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by whyask37 on 2017. 1. 19..
	 */
	
	"use strict";
	
	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	window.issueRegister = function () {
	    'use strict';
	
	    issueForm('/users/register', 'registerForm', [['username', 'username', formVerifier_NoBlank, '이름을 입력하세요.'], ['useridf', 'useridf', formVerifier_AlwaysAllow, '']], function () {
	        window.location.reload(true);
	    });
	};
	
	window.issueLogout = function () {
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
	};
	
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

/***/ },
/* 2 */
/***/ function(module, exports) {

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
	        var text = "";
	        var charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	
	        for (var i = 0; i < length; i++) {
	            text += charset.charAt(Math.floor(Math.random() * charset.length));
	        }return text;
	    }
	
	    // RoomURL의 패턴을 설정합니다.
	    $('#roomURL').attr('pattern', '^' + location.origin + '/[a-zA-Z0-9]{8}|$');
	
	    $('#joinRoom').submit(function (e) {
	        var $roomURL = $('#roomURL');
	        var roomURL = $roomURL.val();
	        if (roomURL === '') {
	            var randomID = generateRandomID(8);
	            roomURL = window.location.origin + "/" + randomID;
	            $roomURL.val(roomURL);
	        }
	        window.location.href = roomURL;
	
	        e.preventDefault();
	    });
	});

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by whyask37 on 2017. 1. 19..
	 */
	
	"use strict";
	
	var Materialize = window.Materialize;
	var io = window.io;
	
	var cmdproc = __webpack_require__(4);
	
	var socket = void 0;
	
	$('#gameDiv').ready(function () {
	    socket = io();
	
	    socket.on('err', function (msg) {
	        Materialize.toast(msg, 3000);
	    });
	
	    socket.on('info', function (msg) {
	        "use strict";
	
	        console.log('info', msg);
	    });
	
	    socket.on('cmd', function (msg) {
	        "use strict";
	
	        console.log('cmd', msg);
	        cmdproc.translateCmdMessage(msg);
	    });
	
	    socket.on('disconnect', function () {
	        "use strict";
	        // alert('서버와의 연결이 끊겼습니다.');
	    });
	});
	
	exports.sendCmd = function (type, object) {
	    "use strict";
	
	    var copy = Object.assign({}, object || {});
	    copy.type = type;
	    socket.emit('cmd', copy);
	    return true;
	};
	
	window.sendCmd = exports.sendCmd;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by whyask37 on 2017. 1. 11..
	 */
	
	"use strict";
	
	var cmdTranslatorMap = {};
	var Materialize = window.Materialize;
	
	var game = __webpack_require__(5);
	var room = __webpack_require__(7);
	
	exports.translateCmdMessage = function (msg) {
	    if (cmdTranslatorMap[msg.type]) cmdTranslatorMap[msg.type](msg);else Materialize.toast('Unknown command message type : ' + msg.type, 4000);
	};
	
	///////////////////////////////////
	
	// Room users
	__webpack_require__(8)(cmdTranslatorMap);
	__webpack_require__(9)(cmdTranslatorMap);
	__webpack_require__(10)(cmdTranslatorMap);
	
	cmdTranslatorMap.gabort = function (obj) {
	    var msg = obj.msg || '게임이 중간에 종료되었습니다.';
	    Materialize.toast(msg, 3000);
	    room.playing = false;
	    room.viewRoom();
	    $('#title').text('openMighty');
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by whyask37 on 2017. 1. 20..
	 */
	
	"use strict";
	
	var game = {};
	var template = __webpack_require__(6);
	
	exports = module.exports = game;
	exports.game = game;
	
	exports.viewDeck = function () {
	    var $playerDeck = $('.deck');
	    $playerDeck.empty();
	
	    for (var i = 0; i < game.deck.length; i++) {
	        var card = game.deck[i];
	        var _ref = [card.shape, card.num],
	            shape = _ref[0],
	            num = _ref[1];
	
	
	        var $deckCardContainer = template(null, 'deck-card');
	        $deckCardContainer.find('.game-card').addClass('game-card-' + shape[0] + num);
	        $playerDeck.append($deckCardContainer);
	    }
	};
	
	// Various utilities
	
	exports.shapeAbbrTable = {
	    'spade': '♠',
	    'heart': '♥',
	    'diamond': '♦',
	    'clover': '♣',
	    'none': 'N'
	};
	
	exports.shapeStringTable = {
	    'spade': '스페이드',
	    'heart': '하트',
	    'diamond': '다이아몬드',
	    'clover': '클로버',
	    'none': '노기루다'
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 * Created by whyask37 on 2017. 1. 20..
	 */
	
	"use strict";
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var Materialize = window.Materialize;
	
	var jqueryMethods = ['text', 'val', 'submit', 'click', 'remove', 'empty'];
	
	module.exports = function ($parent, name, attrs) {
	    var $template = $('#template-' + name).clone().removeAttr('id');
	    if ($parent) {
	        $parent.empty();
	        $parent.append($template);
	    }
	
	    if (!attrs) return $template;
	
	    // Set attributes
	    var $elm = void 0;
	    for (var i = 0; i < attrs.length; i++) {
	        var _attrs$i = _slicedToArray(attrs[i], 2),
	            selector = _attrs$i[0],
	            attributes = _attrs$i[1];
	
	        $elm = selector ? $template.find(selector) : $template;
	        if ($elm.length != 1) {
	            Materialize.toast('Invalid selector : ' + selector, 4000);
	            console.log('Invalid selector', attrs[i]);
	            continue;
	        }
	
	        if (Array.isArray(attributes[0])) {
	            attributes.forEach(applyAttribute);
	        } else applyAttribute(attributes);
	    }
	
	    function applyAttribute(attribute) {
	        var _attribute = _slicedToArray(attribute, 2),
	            attr = _attribute[0],
	            value = _attribute[1];
	
	        if (jqueryMethods.indexOf(attr) != -1) $elm[attr](value);else $elm.attr(attr, value);
	    }
	
	    return $template;
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by whyask37 on 2017. 1. 20..
	 */
	
	"use strict";
	
	var game = __webpack_require__(5);
	var room = {
	    playing: false,
	    myidf: null,
	    owner: 0,
	    users: []
	};
	var conn = __webpack_require__(3);
	var template = __webpack_require__(6);
	
	exports = module.exports = room;
	
	exports.viewRoom = function () {
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
	    $playerSlots.removeClass('player-owner player-president player-self');
	
	    var self = null;
	
	    for (var i = 0; i < users.length; i++) {
	        var $playerSlot = $($playerSlots[i]);
	        var user = users[i];
	        $playerSlot.find('.player-name').text(user.username);
	        $playerSlot.find('.game-card-container').empty();
	
	        if (owner === i) $playerSlot.addClass('player-owner');
	        if (president === i) $playerSlot.addClass('player-president');
	        if (user.useridf == room.myidf) {
	            $playerSlot.addClass('player-self');
	            self = i;
	        }
	    }
	
	    for (var _i = users.length; _i < 5; _i++) {
	        var _$playerSlot = $($playerSlots[_i]);
	        _$playerSlot.find('.player-name').text("Empty");
	        _$playerSlot.find('.game-card-container').empty();
	    }
	
	    if (!room.playing) {
	        if (owner === self) {
	            addStartButton();
	        }
	    } else {
	        game.selfIndex = self;
	    }
	};
	
	function addStartButton() {
	    var $gameCardContainer = $('.player-self').find('.game-card-container');
	    template($gameCardContainer, 'button');
	    $gameCardContainer.find('button').click(function (e) {
	        conn.sendCmd('start');
	        e.preventDefault();
	    });
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by whyask37 on 2017. 1. 19..
	 */
	
	"use strict";
	
	var room = __webpack_require__(7);
	
	var Materialize = window.Materialize;
	
	module.exports = function (cmdTranslatorMap) {
	    cmdTranslatorMap.rjoin = function (msg) {
	        "use strict";
	
	        Materialize.toast(msg.username + '님이 입장하셨습니다.', 2000);
	        room.users.push({
	            username: msg.username,
	            useridf: msg.useridf
	        });
	        room.viewRoom();
	    };
	
	    cmdTranslatorMap.rleft = function (msg) {
	        "use strict";
	
	        var users = room.users;
	        for (var i = 0; i < users.length; i++) {
	            var user = users[i];
	            if (user.useridf == msg.useridf) {
	                Materialize.toast(user.username + '님이 퇴장하셨습니다.', 2000);
	                users.splice(i, 1);
	                break;
	            }
	        }
	        room.owner = msg.owner;
	        if (!room.playing) room.viewRoom();
	    };
	
	    cmdTranslatorMap.rusers = function (msg) {
	        "use strict";
	
	        room.owner = msg.owner;
	        room.users = msg.users;
	        room.myidf = msg.youridf;
	        room.viewRoom();
	    };
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by whyask37 on 2017. 1. 20..
	 */
	
	"use strict";
	
	var Materialize = window.Materialize;
	
	var template = __webpack_require__(6);
	var game = __webpack_require__(5);
	var room = __webpack_require__(7);
	var conn = __webpack_require__(3);
	
	module.exports = function (cmdTranslatorMap) {
	    /**
	     * 게임 유저에 대한 프로세서
	     * @param msg
	     */
	    cmdTranslatorMap.gusers = function (msg) {
	        game.gameUsers = msg.users;
	
	        game.president = -1;
	        game.remainingBidder = 5;
	        game.lastBidder = null;
	
	        room.playing = true;
	        room.viewRoom();
	    };
	
	    /**
	     * 덱이 왔을 때 처리
	     * @param msg
	     */
	    cmdTranslatorMap.deck = function (msg) {
	        game.deck = msg.deck;
	        game.viewDeck();
	    };
	
	    /**
	     * 플레이어가 비딩했다는 정보가 들어왔을 때 (본인 포함)
	     * @param msg
	     */
	    cmdTranslatorMap.pbinfo = function (msg) {
	        var $bidderCardContainer = $($('.player-slot .game-card-container')[msg.bidder]);
	
	        // 패스가 아니라면 마지막 공약 업데이트
	        if (msg.bidShape != 'pass') {
	            game.bidShape = msg.bidShape;
	            game.bidCount = msg.bidCount;
	            game.lastBidder = msg.bidder;
	        }
	
	        // 공약 표시
	        $bidderCardContainer.find('.game-card').remove();
	        var $biddingInfo = $('<div/>').addClass('game-card player-card-bidding');
	        if (msg.bidShape == 'pass') {
	            $biddingInfo.text("pass");
	            game.remainingBidder--;
	        } else {
	            $biddingInfo.text(msg.bidShape + ' ' + msg.bidCount);
	        }
	        $bidderCardContainer.append($biddingInfo);
	
	        // 공약 완료 체크
	        if (game.remainingBidder == 1 && game.lastBidder !== null) {
	            if (game.lastBidder != game.selfIndex) {
	                Materialize.toast("공약이 끝났습니다. 기다려주세요", 1500);
	            }
	            game.president = game.lastBidder;
	        }
	    };
	
	    /**
	     * 공약 요청이 들어왔을 때
	     */
	    cmdTranslatorMap.bidrq = function () {
	        // 최소 공약
	        var bidCount = game.bidCount || 13;
	        if (game.bidShape == 'none') bidCount++;
	
	        var $playerCardContainer = $('.player-self .game-card-container');
	
	        var $bidForm = template($playerCardContainer, 'bidding');
	        $bidForm.attr('id', 'bidForm');
	        $bidForm.find('input[name="bidCount"]').attr('min', bidCount).val(bidCount);
	        $bidForm.submit(function () {
	            "use strict";
	
	            var $bidForm = $('#bidForm');
	            var bidShape = $bidForm.find('*[name="bidShape"]').val();
	            var bidCount = $bidForm.find('*[name="bidCount"]').val();
	            conn.sendCmd('bid', {
	                shape: bidShape,
	                num: parseInt(bidCount)
	            });
	            return false;
	        });
	    };
	
	    /**
	     * 1차 공약 수정 요청이 들어왔을 때
	     */
	    cmdTranslatorMap.bc1rq = function () {
	        Materialize.toast('공약을 수정해주세요.', 1500);
	
	        var bidShape = game.bidShape;
	        var bidCount = game.bidCount;
	
	        var $playerCardContainer = $('.player-self .game-card-container');
	        template($playerCardContainer, 'bidding', [[null, ['id', 'bidChangeForm']], ['.player-form-title', ['text', "현재 : " + game.shapeAbbrTable[bidShape] + bidCount]], ['input[name="bidCount"]', [['min', bidCount], ['val', bidCount]]], ['option[value="' + bidShape + '"]', ['remove']], ['option[value="pass"]', [['val', bidShape], ['text', "그대로 (" + game.shapeStringTable[bidShape] + ")"]]], [null, ['submit', function () {
	            var $bidChangeForm = $('#bidChangeForm');
	            var bidShape = $bidChangeForm.find('*[name="bidShape"]').val();
	            var bidCount = $bidChangeForm.find('*[name="bidCount"]').val();
	            if (bidShape == game.bidShape && bidCount == game.bidCount) bidShape = 'pass';
	
	            conn.sendCmd('bc1', {
	                shape: bidShape,
	                num: parseInt(bidCount)
	            });
	            return false;
	        }]]]);
	    };
	
	    /**
	     * 1차 공약수정 후 공약을 알린다.
	     * @param msg
	     */
	    cmdTranslatorMap.binfo = function (msg) {
	        $('.player-slot .game-card-container').empty();
	
	        var bidString = game.shapeStringTable[msg.shape] + ' ' + msg.num;
	        Materialize.toast('공약 : ' + bidString, 1500);
	        $('#title').text('openMighty - ' + bidString);
	        game.bidShape = msg.shape;
	        game.bidCount = msg.num;
	        game.president = msg.president;
	    };
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by whyask37 on 2017. 1. 20..
	 */
	
	"use strict";
	
	var Materialize = window.Materialize;
	
	var template = __webpack_require__(6);
	var room = __webpack_require__(7);
	var game = __webpack_require__(5);
	var conn = __webpack_require__(3);
	
	module.exports = function (cmdTranslatorMap) {
	    /**
	     * 버려달라는 부탁을 받았을 때.
	     * @param msg
	     */
	    cmdTranslatorMap.fsrq = function () {
	        "use strict";
	
	        Materialize.toast('카드 3장을 버리고 프렌드를 선정하세요', 1500);
	
	        // 덱을 선택할 수 있도록 한다.
	        $('.deck-card').click(function () {
	            $(this).toggleClass('deck-card-selected');
	        });
	
	        var bidCount = game.bidCount;
	        var bidShape = game.bidShape;
	
	        var $playerCardContainer = $('.player-self .game-card-container');
	        var $friendSelector = template($playerCardContainer, 'fselect', [[null, ['id', 'friendSelectForm']], ['option[value=' + bidShape + ']', 'remove'], ['input[name="bidCount"]', [['min', bidCount], ['val', bidCount]]], ['option[value="pass"]', ['val', bidShape]]]);
	
	        $friendSelector.submit(function () {
	            var msg = {};
	            var $fSelectForm = $('#friendSelectForm');
	
	            // 고른 카드 선택
	            var cards = $('.deck .deck-card').toArray();
	            var selected = [];
	            for (var i = 0; i < cards.length; i++) {
	                if ($(cards[i]).hasClass('deck-card-selected')) {
	                    selected.push(i);
	                }
	            }
	            if (selected.length != 3) {
	                Materialize.toast('3장을 골라주세요.', 1500);
	                return false;
	            }
	            msg.discards = selected;
	
	            // 새로운 공약
	            var bidShape = $fSelectForm.find('*[name="bidShape"]').val();
	            var bidCount = $fSelectForm.find('*[name="bidCount"]').val();
	            if (!(bidShape == game.bidShape && bidCount == game.bidCount)) {
	                msg.bidch2 = {
	                    bidShape: bidShape,
	                    bidCount: bidCount
	                };
	            }
	
	            // 프렌드 선택
	            var friendType = $fSelectForm.find('select[name=friendType]').val();
	            var cardMap = {
	                'mighty': { shape: bidShape == 'spade' ? 'diamond' : 'spade', num: 14 },
	                'joker': { shape: 'joker', num: 0 },
	                'girudaA': { shape: bidShape, num: 14 },
	                'girudaK': { shape: bidShape, num: 13 }
	            };
	            if (cardMap[friendType]) {
	                var friendCard = cardMap[friendType];
	                msg.ftype = 'card';
	                msg.shape = friendCard.shape;
	                msg.num = friendCard.num;
	            } else {
	                Materialize.toast('프렌드를 선정해주세요.', 1500);
	                return false;
	            }
	
	            conn.sendCmd('fs', msg);
	            return false;
	        });
	    };
	};

/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map