/**
 * Created by whyask37 on 2017. 1. 20..
 */

"use strict";


const game = {};
const template = require('./template');

exports = module.exports = game;


exports.viewDeck = function () {
    const $playerDeck = $('.deck');
    $playerDeck.empty();

    for (let i = 0; i < game.deck.length; i++) {
        const card = game.deck[i];
        const [shape, num] = [card.shape, card.num];

        const $deckCardContainer = template(null, 'deck-card');
        const cardIdf = shape[0] + num;
        $deckCardContainer.find('.game-card')
            .attr('card', cardIdf)
            .addClass('game-card-' + cardIdf)
            .addClass('game-card-shape-' + shape[0]);
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
