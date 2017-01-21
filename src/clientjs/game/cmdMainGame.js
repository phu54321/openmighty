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
}

function unbindClick() {
    $('.deck-card')
        .removeClass('deck-card-selected')
        .unbind('click');
}

function initGame() {
    game.trick = 0;
    game.obtained = [[], [], [], [], []];
    issueTrickStart();
}

exports = module.exports = function (cmdTranslatorMap) {
    function filterSelectableCards(msg) {
        // 조커콜
        if(msg.jcall) {
            const jokerCard = $('.game-card-shape-j');
            if(jokerCard.length !== 0) {
                jokerCard
                    .parents('deck-card')
                    .addClass('deck-card-selectbale');
                return;
            }
        }
        // 기존 문양이 있을 경우
        else if(msg.shaperq) {
            const rqShapeCards = $('.game-card-shape-' + msg.shaperq[0]);
            if(rqShapeCards) {
                rqShapeCards
                    .parents('deck-card')
                    .addClass('deck-card-selectable');
                return;
            }
        }
        $('.deck-card').addClass('deck-card-selectable');
    }

    cmdTranslatorMap.cprq = function (msg) {
        "use strict";
        Materialize.toast('카드를 내주세요.', 1500);

        filterSelectableCards(msg);

        const $gameCardContainer = $('.player-self .game-card-container');
        template($gameCardContainer, 'button', [
            ['button', [
                ['text', '카드 내기'],
                ['disabled', true],
            ]]
        ]);

        $('.deck-card-selectable').click(function () {
            $('.deck-card').removeClass('deck-card-selected');
            $(this).addClass('deck-card-selected');
            $gameCardContainer.find('button').prop('disabled', false);
        });

        $gameCardContainer.find('button').click(function() {
            const $selected = $('.deck-card-selected');
            if($selected.length != 1) {
                Materialize.toast("카드를 선택해주세요.", 1500);
            }

            // TODO : 조커콜 여부 처리
            conn.sendCmd('cp', {
                cardIdx: $selected.index('.deck-card')
            });
        });
    };

    /**
     * 다른 플레이어가 카드를 냈을 때
     */
    cmdTranslatorMap.pcp = function (msg) {
        "use strict";
        const card = msg.card;

        const $playerSlot = $($('.player-slot')[msg.player]);
        const $gameCardContainer = $playerSlot.find('.game-card-container');
        template($gameCardContainer, 'game-card', [
            [null, ['addClass', 'game-card-' + card.shape[0] + card.num]]
        ]);
        unbindClick();
    };

    /**
     * 트릭이 끝났을 경우
     */
    cmdTranslatorMap.tend = function (msg) {
        const winner = msg.winner;
        // TODO: 이긴 카드를 모으는 로직 추가
        $('.player-slot .game-card').fadeOut(1000);
        issueTrickStart();
    };
};

exports.issueTrickStart = issueTrickStart;
exports.initGame = initGame;
