/**
 * Created by whyask37 on 2017. 1. 14..
 */

"use strict";

const _ = require('underscore');

const cardShapes = exports.cardShapes = ['spade', 'heart', 'clover', 'diamond', 'joker'];
const bidShapes = exports.bidShapes = ['spade', 'heart', 'clover', 'diamond', 'none'];


function Card(shape, num) {
    this.shape = shape;
    this.num = num;
}

Card.prototype.equals = function (rhs) {
    return rhs.shape == this.shape && rhs.num == this.num;
};

exports.createCard = function (shape, num) {
    if(shape == 'joker') num = 0;
    else if(!isValidCardParam(shape, num)) return null;
    return new Card(shape, num);
};


////////


function compareCard(a, b) {
    const aShapeCode = cardShapes.indexOf(a.shape);
    const bShapeCode = cardShapes.indexOf(b.shape);

    if(aShapeCode < bShapeCode) return -1;
    else if(aShapeCode > bShapeCode) return 1;
    else return b.num - a.num;
}

exports.compareCard = compareCard;


/**
 * 덱을 정렬합니다.
 */
exports.sortDeck = function (deck) {
    deck.sort(compareCard);
    return deck;
};


/**
 * 덱에 카드가 있는지 봅니다
 */
function hasShapeOnDeck(shape, deck) {
    return !_.every(deck, (card) => card.shape != shape);
}

exports.hasShapeOnDeck = hasShapeOnDeck;

//////////


function isValidCardParam(shape, num) {
    if (shape == 'joker') return num === 0;
    else return cardShapes.indexOf(shape) != -1 && 2 <= num && num <= 14;
}

exports.isValidCardParam = isValidCardParam;



exports.isScoreCard = function (card) {
    return card.num >= 10;
};

exports.cardDealMissScore = function (card) {
    if(card.shape == 'spade' && card.num == 14) return -1; // 마이티 0점
    else if(card.shape == 'joker') return 0;  // 조커 -1점
    else if(card.num == 10) return 0.5;  // 10은 0.5점
    else if(card.num >= 11) return 1;  // JQKA는 1점
    else return 0;  // 나머지는 0점
};
