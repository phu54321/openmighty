/**
 * Created by whyask37 on 2017. 2. 3..
 */

"use strict";

const cardShapes = ['spade', 'heart', 'clover', 'diamond', 'joker'];
exports.cardShapes = cardShapes;


// Card class
class Card {
    constructor(shape, num) {
        this.shape = shape;
        this.num = num;
        if(shape == 'joker') this.cardEnvID = 52;
        else this.cardEnvID = 13 * cardShapes.indexOf(shape) + num - 2;
    }

    equals(rhs) {
        return rhs.shape == this.shape && rhs.num == this.num;
    }

    isScoreCard() {
        return this.num >= 10;
    }

    getDealMissScore() {
        if(this.shape == 'spade' && this.num == 14) return -1; // 마이티 -1점
        else if(this.shape == 'joker') return 0;  // 조커 0점
        else if(this.num == 10) return 0.5;  // 10은 0.5점
        else if(this.num >= 11) return 1;  // JQKA는 1점
        else return 0;  // 나머지는 0점
    }

    // 문자열로 변환 쉽게
    toString() {
        return this.shape[0] + this.num;
    }
}


// Card factory

function isValidCardParam(shape, num) {
    if (shape == 'joker') return num === 0;
    else return cardShapes.indexOf(shape) != -1 && 2 <= num && num <= 14;
}
exports.isValidCardParam = isValidCardParam;


exports.createCard = function (shape, num) {
    if(shape == 'joker') num = 0;
    else if(!isValidCardParam(shape, num)) return null;
    return new Card(shape, num);
};
