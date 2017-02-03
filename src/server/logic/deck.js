/**
 * Created by whyask37 on 2017. 2. 3..
 */

"use strict";

const card = require('./card'),
    cardShapes = card.cardShapes;
const _ = require('lodash');


function compareCard(a, b) {
    const aShapeCode = cardShapes.indexOf(a.shape);
    const bShapeCode = cardShapes.indexOf(b.shape);

    if(aShapeCode < bShapeCode) return -1;
    else if(aShapeCode > bShapeCode) return 1;
    else return b.num - a.num;
}


/////////////////

class Deck extends Array {
    constructor(cards) {
        super();
        Deck.prototype.splice.apply(this, [0, 0].concat(cards));
    }

    slice(start, end) {
        return new Deck(super.slice(start, end));
    }

    concat(array) {
        return new Deck(super.concat(array));
    }

    // Sort를 카드 문양대로
    sort(cmpf) {
        if(!cmpf) cmpf = compareCard;
        return super.sort(cmpf);
    }

    hasCard(card) {
        return !_.every(this, (c) => (c != card));
    }

    hasShape(shape) {
        return !_.every(this, (c) => (c.shape != shape));
    }

    getDealMissScore() {
        return _.sum(_.map(this, (c) => c.getDealMissScore()));
    }


}

module.exports = Deck;
