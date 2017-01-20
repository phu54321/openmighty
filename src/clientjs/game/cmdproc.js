/**
 * Created by whyask37 on 2017. 1. 11..
 */

"use strict";

const cmdTranslatorMap = {};
const Materialize = window.Materialize;

exports.translateCmdMessage = function (msg) {
    if(cmdTranslatorMap[msg.type]) cmdTranslatorMap[msg.type](msg);
    else Materialize.toast('Unknown command message type : ' + msg.type, 5000);
};

const gameMod = require('./game');
const game = gameMod.game;
const room = gameMod.room;

function getSelfSlot() {
    "use strict";
    return $('.player-slot.player-self');
}


///////////////////////////////////

// Room users
require('./cmdproc_room')(cmdTranslatorMap);


///////////////////////////////////

// Game init


function viewDeck() {
    const $playerDeck = $('.deck');
    $playerDeck.find('.deck-card-container').remove();

    for(let i = 0 ; i < game.deck.length ; i++) {
        const card = game.deck[i];
        const [shape, num] = [card.shape, card.num];

        const $deckCardContainer = $('<div/>').addClass('deck-card-container');
        const $deckCard = $('<div/>').addClass('deck-card game-card-container');
        const $gameCard = $('<div/>').addClass('game-card game-card-' + shape[0] + num);
        $deckCard.append($gameCard);
        $deckCardContainer.append($deckCard);
        $playerDeck.append($deckCardContainer);
    }
}

cmdTranslatorMap.gusers = function (msg) {
    "use strict";
    game.gameUsers = msg.users;
    game.president = -1;
    game.remainingBidder = 5;
    room.playing = true;
    game.lastBidder = null;
    gameMod.viewRoom();
};


cmdTranslatorMap.deck = function (msg) {
    "use strict";
    game.deck = msg.deck;
    viewDeck();
};


cmdTranslatorMap.pbinfo = function (msg) {
    "use strict";
    const $playerSlot = $($('.player-slot')[msg.bidder]);
    const $playerCardContainer = $playerSlot.find('.game-card-container');

    if(msg.bidShape != 'pass') {
        game.bidShape = msg.bidShape;
        game.bidCount = msg.bidCount;
        game.lastBidder = msg.bidder;
    }

    $playerCardContainer.find('.game-card').remove();
    const $biddingInfo = $('<div/>').addClass('game-card player-card-bidding');
    if(msg.bidShape == 'pass') {
        $biddingInfo.text("pass");
        game.remainingBidder--;
    }
    else {
        $biddingInfo.text(msg.bidShape + ' ' + msg.bidCount);
    }
    $playerCardContainer.append($biddingInfo);
    checkBidComplete();
};

function checkBidComplete() {
    "use strict";
    if(game.remainingBidder == 1 && game.lastBidder !== null) {
        Materialize.toast("공약이 끝났습니다. 기다려주세요", 4000);
    }
}



cmdTranslatorMap.bidrq = function () {
    "use strict";

    const $selfPlayerSlot = getSelfSlot();
    const $playerCardContainer = $selfPlayerSlot.find('.game-card-container');

    let bidCount = game.bidCount || 13;
    if(game.bidShape == 'none') bidCount++;

    $playerCardContainer.html(`
<form id='bidForm' action="javascript:sendBid();" class="game-card player-bid-form">
    <div class="player-bid-form-title">공약</div>
    <select name="bidShape" class="browser-default">
        <option value="pass" selected="">패스</option>
        <option value="spade">삽 (스페이드)</option>
        <option value="heart">트 (하트)</option>
        <option value="diamond">다리 (다이아몬드)</option>
        <option value="clover">끌 (클로버)</option>
        <option value="none">노 (노기루다)</option>
    </select>
    <span class="range-field">
        <input type="range" name="bidCount" min="${bidCount}" max="20" value="${bidCount}">
    </span>
    <button type="submit" class="btn waves-effect waves-light">공약</button>
</form>
`);
};

function sendBid() {
    "use strict";

    const $bidForm = $('#bidForm');
    const bidShape = $bidForm.find('*[name="bidShape"]').val();
    const bidCount = $bidForm.find('*[name="bidCount"]').val();
    sendCmd('bid', {
        shape: bidShape,
        num: parseInt(bidCount)
    });
    return false;
}



cmdTranslatorMap.bc1rq = function () {
    "use strict";

    Materialize.toast('공약을 수정해주세요.');

    const $selfPlayerSlot = getSelfSlot();
    const $playerCardContainer = $selfPlayerSlot.find('.game-card-container');

    const bidShape = game.bidShape;
    const bidCount = game.bidCount;

    const abbrTable = {
        'spade' : '♠',
        'heart' : '♥',
        'diamond' : '♦',
        'clover' : '♣',
        'none' : 'N',
    };


    $playerCardContainer.html(`
<form id='bidChangeForm' action="javascript:sendBidChange1();" class="game-card player-bid-form">
    <div class="player-bid-form-title">현재 : ${abbrTable[bidShape]}${bidCount}</div>
    <select name="bidShape" class="browser-default">
        <option value="none" selected>그대로</option>    
        <option value="spade">삽 (스페이드)</option>
        <option value="heart">트 (하트)</option>
        <option value="diamond">다리 (다이아몬드)</option>
        <option value="clover">끌 (클로버)</option>
        <option value="none">노 (노기루다)</option>
    </select>
    <span class="range-field">
        <input type="range" name="bidCount" min="${bidCount}" max="20" value="${bidCount}">
    </span>
    <button type="submit" class="btn waves-effect waves-light">공약 수정</button>
</form>`);

    const shapeTable = {
        'spade' : '스페이드',
        'heart' : '하트',
        'diamond' : '다이아몬드',
        'clover' : '클로버',
        'none' : '노기루다',
    };

    $playerCardContainer.find('option[value="' + bidShape + '"]').remove();
    $playerCardContainer.find('option[value="none"]')
        .val("bidShape")
        .text("그대로 (" + shapeTable[bidShape] + ")");
};


function sendBidChange1() {
    "use strict";

    const $bidChangeForm = $('#bidChangeForm');
    let bidShape = $bidChangeForm.find('*[name="bidShape"]').val();
    const bidCount = $bidChangeForm.find('*[name="bidCount"]').val();
    if(bidShape == game.bidShape && bidCount == game.bidCount) bidShape = 'pass';

    sendCmd('bc1', {
        shape: bidShape,
        num: parseInt(bidCount)
    });
    return false;

}

////

