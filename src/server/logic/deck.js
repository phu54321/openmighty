/**
 * Created by whyask37 on 2017. 2. 3..
 */

"use strict";

const card = require('./card'),
    cardShapes = card.cardShapes;
const _ = require('lodash');


function compareCard(a, b) {
    // 문양에 대해선 오름차순, 숫자에 대해선 내림차순으로 정렬해야하므로
    // 단순 cardEnvID로 정렬하기 힘들다.
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
        for(let i = 0 ; i < cards.length ; i++) {
            this[i] = cards[i];
        }
    }

    slice(start, end) {
        return new Deck(super.slice(start, end));
    }

    concat(array) {
        return new Deck(super.concat(array));
    }

    filter(predicate) {
        return new Deck(super.filter(predicate));
    }

    // Sort를 카드 문양대로
    sort(cmpf) {
        if(!cmpf) cmpf = compareCard;
        return super.sort(cmpf);
    }

    hasCard(card) {
        return this.indexOf(card) != -1;
    }

    hasShape(shape) {
        return !_.every(this, (c) => (c.shape != shape));
    }

    indexOf(card) {
        return this.findIndex((c) => c.equals(card));
    }

    getDealMissScore() {
        return _.sum(_.map(this, (c) => c.getDealMissScore()));
    }

    splitShapes() {
        const ret = {
            spade: new Deck([]),
            clover: new Deck([]),
            heart: new Deck([]),
            diamond: new Deck([]),
            joker: new Deck([])
        };
        this.forEach(card => {
            ret[card.shape].push(card);
        });
        return ret;
    }
}

module.exports = Deck;
