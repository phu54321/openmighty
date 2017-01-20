/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";


const game = {};
const template = require('./template');

exports = module.exports = game;
exports.game = game;


exports.viewDeck = function () {
    const $playerDeck = $('.deck');
    $playerDeck.empty();

    for (let i = 0; i < game.deck.length; i++) {
        const card = game.deck[i];
        const [shape, num] = [card.shape, card.num];

        const $deckCardContainer = template('deck-card');
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
    'none': 'N',
};

exports.shapeStringTable = {
    'spade': '스페이드',
    'heart': '하트',
    'diamond': '다이아몬드',
    'clover': '클로버',
    'none': '노기루다',
};
