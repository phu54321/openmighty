/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";

const Materialize = window.Materialize;

const template = require('./template');
const room = require('./room');
const game = require('./game');
const conn = require('./conn');

module.exports = function (cmdTranslatorMap) {
    /**
     * 버려달라는 부탁을 받았을 때.
     * @param msg
     */
    cmdTranslatorMap.d3rq = function () {
        "use strict";
        Materialize.toast('카드 3장을 버려주세요', 1500);


        // 덱을 선택할 수 있도록 한다.
        $('.deck-card').click(function() {
            $(this).toggleClass('deck-card-selected');
        });

        const $playerCardContainer = $('.player-self .game-card-container');
        const $button = template($playerCardContainer, 'button');
        $button.find('button').text("버리기");
        $button.find('button').click(function(e) {
            // 고른 카드 선택
            const cards = $('.deck .deck-card').toArray();
            const selected = [];
            for(let i = 0 ; i < cards.length ; i++) {
                const $card = $(cards[i]);
                if($card.hasClass('deck-card-selected')) {
                    selected.push(i);
                }
            }
            if(selected.length != 3) {
                Materialize.toast('3장을 골라주세요.', 1500);
                return false;
            }

            conn.sendCmd('d3', {cards: selected});
            e.preventDefault();
        });
    };
};
