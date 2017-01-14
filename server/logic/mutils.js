/**
 * Created by whyask37 on 2017. 1. 14..
 */

"use strict";

const cardShapes = exports.cardShapes = ['spade', 'diamond', 'clover', 'heart', 'joker'];
const bidShapes = exports.bidShapes = ['spade', 'diamond', 'clover', 'heart', 'none'];

function compareCard(a, b) {
    const aShapeCode = cardShapes.indexOf(a.shape);
    const bShapeCode = cardShapes.indexOf(b.shape);

    if(aShapeCode < bShapeCode) return -1;
    else if(aShapeCode > bShapeCode) return 1;
    else return a.num - b.num;
}

exports.compareCard = compareCard;

exports.sortDeck = function (deck) {
    deck.sort(compareCard);
    return deck;
};


//////////


exports.isValidCardParam = function (shape, num) {
    if (shape == 'joker') return num === 0;
    else return cardShapes.indexOf(shape) != -1 && 2 <= num && num <= 14;
};

exports.isScoreCard = function (card) {
    return card.num >= 10;
};

exports.cardDealMissScore = function (card) {
    if(card.shape == 'spade' && card.num == 14) return 0; // 마이티 0점
    else if(card.shape == 'joker') return -1;  // 조커 -1점
    else if(card.num == 10) return 0.5;  // 10은 0.5점
    else if(card.num >= 11) return 1;  // JQKA는 1점
    else return 0;  // 나머지는 0점
};
