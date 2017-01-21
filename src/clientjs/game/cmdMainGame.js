/**
 * Created by whyask37 on 2017. 1. 21..
 */

"use strict";

const Materialize = window.Materialize;

const template = require('./template');
const game = require('./game');
const room = require('./room');
const conn = require('./conn');

function issueTrickStart() {
    unbindClick();
    game.trick++;
}

function unbindClick() {
    $('.deck-card')
        .removeClass('deck-card-selected')
        .unbind('click');
}

function initGame() {
    game.trick = 0;
    game.starter = game.president;
    issueTrickStart();
}

function decodeCard($card) {
    const cardIdf = $card.attr('card');
    const shape = {
        's': 'spade', 'h': 'heart',
        'c': 'clover', 'd': 'diamond',
        'j': 'joker'
    }[cardIdf[0]];
    const num = parseInt(cardIdf.substr(1));
    return {shape: shape, num: num};
}



exports = module.exports = function (cmdTranslatorMap) {
    function filterSelectableCards(msg) {
        // 조커콜
        if(msg.jcall) {
            const jokerCard = $('.game-card-shape-j');
            if(jokerCard.length !== 0) {
                jokerCard
                    .parents('.deck-card')
                    .addClass('deck-card-selectbale');
                return;
            }
        }
        // 기존 문양이 있을 경우
        else if(msg.shaperq) {
            const $rqShapeCards = $('.game-card-shape-' + msg.shaperq[0]);
            if($rqShapeCards.length !== 0) {
                $rqShapeCards
                    .parents('.deck-card')
                    .addClass('deck-card-selectable');
                return;
            }
        }
        $('.deck-card').addClass('deck-card-selectable');
    }

    /**
     * 카드를 내라는 요청
     * @param msg
     */
    cmdTranslatorMap.cprq = function (msg) {
        "use strict";
        Materialize.toast('카드를 내주세요.', 1500);

        const $gameCardContainer = $('.player-self .game-card-container');
        template($gameCardContainer, 'button', [
            ['button', [
                ['text', '카드 내기'],
                ['disabled', true],
            ]]
        ]);

        // 카드 선택 활성화.
        filterSelectableCards(msg);
        $('.deck-card-selectable').click(function () {
            $('.deck-card').removeClass('deck-card-selected');
            $(this).addClass('deck-card-selected');
            $gameCardContainer.find('button').prop('disabled', false);
        });

        // 카드 내기를 할 때
        $gameCardContainer.find('button').click(function() {
            const $selected = $('.deck-card-selected');
            if($selected.length != 1) {
                Materialize.toast("카드를 선택해주세요.", 1500);
            }

            const card = decodeCard($selected.find('.game-card'));

            // 조커콜 처리
            if(
                game.trick != 1 &&
                card.num == 3 &&
                game.starter == game.selfIndex && (
                    game.bidShape == 'clover' && card.shape == 'spade' ||
                    game.bidShape != 'clover' && card.shape == 'clover'
                )
            ) {
                const $jokerCallModal = $('#jokerCallModal');
                $jokerCallModal.find('button[name=no]').click(() => {
                    conn.sendCmd('cp', {
                        cardIdx: $selected.index('.deck-card')
                    });
                });
                $jokerCallModal.find('button[name=yes]').click(() => {
                    conn.sendCmd('cp', {
                        cardIdx: $selected.index('.deck-card'),
                        jcall: true
                    });
                });
                $jokerCallModal.modal({
                    dismissible: false
                });
                $jokerCallModal.modal('open');
            }

            else if(card.shape == 'joker' && game.starter == game.selfIndex) {
                const $jokerModal = $('#jokerModal');
                const $callShape = $jokerModal.find('select[name=srq]');
                $callShape.val('none');
                $jokerModal.modal({
                    dismissible: false
                });

                $jokerModal.find('button').click(() => {
                    let callShape = $callShape.val();
                    if(callShape == 'none') callShape = undefined;
                    conn.sendCmd('cp', {
                        cardIdx: $selected.index('.deck-card'),
                        srq: callShape
                    });
                });
                $jokerModal.modal('open');
            }

            else {
                // 일반 카드
                conn.sendCmd('cp', {
                    cardIdx: $selected.index('.deck-card')
                });
            }
        });
    };

    /**
     * 조커로 문양을 부를 때
     */
    cmdTranslatorMap.jrq = function (msg) {
        const shapeRequest = msg.shaperq;
        Materialize.toast('조커로 ' + game.shapeStringTable[shapeRequest] + '를 불렀습니다.', 2000);
    };


    /**
     * 다른 플레이어가 카드를 냈을 때
     */
    cmdTranslatorMap.pcp = function (msg) {
        "use strict";
        const card = msg.card;

        const $playerSlot = $($('.player-slot')[msg.player]);

        if(
            game.ftype == 'card' &&
            game.fargs.shape == card.shape &&
            game.fargs.num == card.num
        ) {
            // 프렌드 발견
            $playerSlot.addClass('player-leading');
        }


        const $gameCardContainer = $playerSlot.find('.game-card-container');

        const cardIdf = card.shape[0] + card.num;
        template($gameCardContainer, 'game-card', [
            [null, [
                ['addClass', 'game-card-' + cardIdf],
                ['card', cardIdf]
            ]],
        ]);
        unbindClick();
    };

    function createCardIcon(card) {
        if(card.shape == 'joker') {
            return $('<div/>').addClass('has-slot has-joker').text('Joker');
        }
        let numStr = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'][card.num - 2];
        return $('<div/>')
                .addClass('has-slot')
                .addClass('has-' + card.shape)
                .text(numStr);
    }

    /**
     * 트릭이 끝났을 경우
     */
    cmdTranslatorMap.tend = function (msg) {
        const $winnerHas = $($('.player-has')[msg.winner]);
        const $cards = $('.player-slot .game-card');

        const $lastTricks = $('.last-trick');
        $lastTricks.empty();

        // 카드를 모은다
        $cards.each(function () {
            const card = decodeCard($(this));
            $lastTricks.append(createCardIcon(card));
            if(card.num >= 10) {
                $winnerHas.append(createCardIcon(card));
            }
        });

        // 초구 프렌드
        if(
            game.ftype == 'first' &&
            game.president != msg.winner &&
            $('.player-leading').length != 2 &&
            game.trick <= 4
        ) {
            // 프렌드 발견
            $($('.player-slot')[msg.winner]).addClass('player-leading');
        }

        $cards.fadeOut(1000);
        game.starter = msg.winner;
        issueTrickStart();
    };

    /**
     * 게임 종료시
     * @param msg
     */
    cmdTranslatorMap.gend = function (msg) {
        const bid = game.bidCount;
        const got = 20 - msg.oppcc;
        const $modal = $('#gameEndModal');
        const $modalText = $modal.find('.modal-content p');
        if(got >= bid) $modalText.text('[' + got + '/' + bid + '] 여당 승리입니다.');
        else $modalText.text('[' + got + '/' + bid + '] 야당 승리입니다.');
        room.playing = false;
        $modal.modal({
            dismissible: true,
            complete: function() {
                if(!room.playing) {
                    room.viewRoom();
                    $('#title').text('openMighty');
                }
            }
        });
        $modal.modal('open');
    };

};

exports.issueTrickStart = issueTrickStart;
exports.initGame = initGame;
