/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";

const Materialize = window.Materialize;

const template = require('./template');
const game = require('./game');
const room = require('./room');
const conn = require('./conn');

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
        const $bidderCardContainer = $($('.player-slot .game-card-container')[msg.bidder]);

        // 패스가 아니라면 마지막 공약 업데이트
        if (msg.bidShape != 'pass') {
            game.bidShape = msg.bidShape;
            game.bidCount = msg.bidCount;
            game.lastBidder = msg.bidder;
        }

        // 공약 표시
        $bidderCardContainer.find('.game-card').remove();
        const $biddingInfo = $('<div/>').addClass('game-card player-card-bidding');
        if (msg.bidShape == 'pass') {
            $biddingInfo.text("pass");
            game.remainingBidder--;
        }
        else {
            $biddingInfo.text(msg.bidShape + ' ' + msg.bidCount);
        }
        $bidderCardContainer.append($biddingInfo);

        // 공약 완료 체크
        if (game.remainingBidder == 1 && game.lastBidder !== null) {
            if(game.lastBidder != game.selfIndex) {
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
        let bidCount = game.bidCount || 13;
        if (game.bidShape == 'none') bidCount++;

        const $playerCardContainer = $('.player-self .game-card-container');

        const $bidForm = template($playerCardContainer, 'bidding');
        $bidForm.attr('id', 'bidForm');
        $bidForm.find('input[name="bidCount"]')
            .attr('min', bidCount)
            .val(bidCount);
        $bidForm.submit(function() {
            "use strict";

            const $bidForm = $('#bidForm');
            const bidShape = $bidForm.find('*[name="bidShape"]').val();
            const bidCount = $bidForm.find('*[name="bidCount"]').val();
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

        const bidShape = game.bidShape;
        const bidCount = game.bidCount;

        const $playerCardContainer = $('.player-self .game-card-container');
        template($playerCardContainer, 'bidding', [
            [null, ['id', 'bidChangeForm']],

            ['.player-form-title', ['text', "현재 : " + game.shapeAbbrTable[bidShape] + bidCount]],

            ['input[name="bidCount"]', [
                ['min', bidCount],
                ['val', bidCount]
            ]],

            ['option[value="' + bidShape + '"]', ['remove']],

            ['option[value="pass"]', [
                ['val', bidShape],
                ['text', "그대로 (" + game.shapeStringTable[bidShape] + ")"]
            ]],
            [null, ['submit', function() {
                const $bidChangeForm = $('#bidChangeForm');
                let bidShape = $bidChangeForm.find('*[name="bidShape"]').val();
                const bidCount = $bidChangeForm.find('*[name="bidCount"]').val();
                if (bidShape == game.bidShape && bidCount == game.bidCount) bidShape = 'pass';

                conn.sendCmd('bc1', {
                    shape: bidShape,
                    num: parseInt(bidCount)
                });
                return false;
            }]]
        ]);
    };

    /**
     * 1차 공약수정 후 공약을 알린다.
     * @param msg
     */
    cmdTranslatorMap.binfo = function (msg) {
        $('.player-slot .game-card-container').empty();

        const bidString = game.shapeStringTable[msg.shape] + ' ' + msg.num;
        Materialize.toast('공약 : ' + bidString, 1500);
        $('#title').text('openMighty - ' + bidString);
        game.bidShape = msg.shape;
        game.bidCount = msg.num;
        game.president = msg.president;
    };
};

