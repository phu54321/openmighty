/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";

const Materialize = window.Materialize;

const _ = window._;
const template = require('./template');
const room = require('./room');
const game = require('./game');
const sendcmd = require('./sendCmd');
const mainGame = require('./cmdMainGame');

module.exports = function (cmdTranslatorMap) {
    function genCardMap(bidShape) {
        return {
            'mighty': {shape: bidShape == 'spade' ? 'diamond' : 'spade', num: 14},
            'joker': {shape: 'joker', num: 0},

            'girudaA': {shape: bidShape, num: 14},
            'girudaK': {shape: bidShape, num: 13},
            'girudaQ': {shape: bidShape, num: 12},
            'girudaJ': {shape: bidShape, num: 11},

            'card_sA': {shape: 'spade', num: 14},
            'card_sK': {shape: 'spade', num: 13},
            'card_hA': {shape: 'heart', num: 14},
            'card_hK': {shape: 'heart', num: 13},
            'card_dA': {shape: 'diamond', num: 14},
            'card_dK': {shape: 'diamond', num: 13},
            'card_cA': {shape: 'clover', num: 14},
            'card_cK': {shape: 'clover', num: 13},
        };
    }


    /**
     * 프렌드 타입 -> 메세지
     * @param bidShape
     * @param friendType
     * @param msg
     * @returns {boolean}
     */
    function encodeFriend(bidShape, friendType, msg) {
        if(bidShape === null) return false;

        const cardMap = genCardMap(bidShape);
        if(cardMap[friendType]) {
            const friendCard = cardMap[friendType];
            msg.ftype = 'card';
            msg.shape = friendCard.shape;
            msg.num = friendCard.num;
            return true;
        }
        else if(friendType == 'first') {
            msg.ftype = 'first';
            return true;
        }
        else if(friendType.startsWith('player')) {
            msg.ftype = 'player';
            msg.friend = parseInt(friendType.substr(7)) - 1;
            return true;
        }
        else if(friendType == 'none') {
            msg.ftype = 'none';
            return true;
        }
        return false;
    }


    /**
     * 메세지 -> 프렌드 타입
     * @param bidShape
     * @param msg
     * @returns {*}
     */
    function decodeFriend(bidShape, msg) {
        const cardMap = genCardMap(bidShape);

        if(msg.ftype == 'card') {
            let ftype = null;
            _.keys(cardMap).some((key) => {
                const card = cardMap[key];
                if(card.shape == msg.args.shape && card.num == msg.args.num) {
                    ftype = key;
                    return true;
                }
            });
            if(ftype) {
                return template
                        .getTemplate('fselect')
                        .find('option[value="' + ftype + '"]')
                        .text() + " 프렌드";
            }
            else {
                return (
                    game.shapeStringTable[msg.args.shape] + ' ' +
                    game.numStringTable[msg.args.num] + ' 프렌드');
            }
        }
        else if(msg.ftype == 'first') return '선구 프렌드';
        else if(msg.ftype == 'none') return '노프렌드';
        else if(msg.ftype == 'player') {
            $($('.player-slot')[msg.args]).addClass('player-leading');
            return game.gameUsers[msg.args].username + ' 프렌드';
        }
        else return '알수없는 프렌드 - ' + String(msg.ftype);
    }

    /**
     * 버려달라는 부탁을 받았을 때.
     * @param msg
     */
    cmdTranslatorMap.fsrq = function () {
        "use strict";
        Materialize.toast('카드 3장을 버리고 프렌드를 선정하세요', 1500);


        // 덱을 선택할 수 있도록 한다.
        $('.deck-card').click(function() {
            $(this).toggleClass('deck-card-selected');
        });

        const bidCount = game.bidCount;
        const bidShape = game.bidShape;

        const $playerCardContainer = $('.player-self .game-card-container');
        const $friendSelector = template($playerCardContainer, 'fselect', [
            [null, ['id', 'friendSelectForm']],
            ['option[value=' + bidShape + ']', ['remove']],
            ['input[name="bidCount"]', [
                ['min', bidCount],
                ['val', bidCount]
            ]],
            ['option[value="pass"]', ['val', bidShape]],
        ]);

        $friendSelector.submit(function(e) {
            e.preventDefault();

            const msg = {};
            const $fSelectForm = $('#friendSelectForm');

            // 고른 카드 선택
            const cards = $('#gameDiv .deck .deck-card').toArray();
            const selected = [];
            for(let i = 0 ; i < cards.length ; i++) {
                if($(cards[i]).hasClass('deck-card-selected')) {
                    selected.push(i);
                }
            }
            if(selected.length != 3) {
                Materialize.toast('3장을 골라주세요.', 1500);
                return false;
            }
            msg.discards = selected;

            // 새로운 공약
            const bidShape = $fSelectForm.find('*[name="bidShape"]').val();
            const bidCount = $fSelectForm.find('*[name="bidCount"]').val();
            if (!(bidShape == game.bidShape && bidCount == game.bidCount)) {
                msg.bidch2 = {
                    shape: bidShape,
                    num: parseInt(bidCount)
                };
            }

            // 프렌드 선택
            const friendType = $fSelectForm.find('select[name=friendType]').val();
            if(!encodeFriend(bidShape, friendType, msg)) {
                Materialize.toast('프렌드를 선정해주세요.', 1500);
                return false;
            }

            sendcmd.sendFriendSelectAndDiscard3(msg);

            return false;
        });
    };


    /**
     * 프렌드 선정 완료
     * @param msg
     */
    cmdTranslatorMap.fs = function (msg) {
        const friendString = decodeFriend(game.bidShape, msg);
        Materialize.toast(friendString, 2000);
        game.ftype = msg.ftype;
        game.fargs = msg.args;

        const $title = $('#title');
        $title.text($title.text() + ' - ' + friendString);

        mainGame.initGame();
    };
};
