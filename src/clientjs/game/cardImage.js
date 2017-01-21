/**
 * Created by whyask37 on 2017. 1. 21..
 */

"use strict";

module.exports = function (cb) {
    const imageObj = new Image();

    imageObj.onload = onCardImageLoad;
    imageObj.src = '/images/cards/sprite.png';

    const cardData = [
        ['c10', 129, 0], ['c11', 774, 370], ['c12', 258, 0], ['c13', 0, 185],
        ['c14', 129, 185], ['c2', 258, 185], ['c3', 387, 0], ['c4', 387, 185],
        ['c5', 516, 0], ['c6', 516, 185], ['c7', 0, 370], ['c8', 129, 370],
        ['c9', 258, 370], ['d10', 387, 370], ['d11', 516, 370], ['d12', 645, 0],
        ['d13', 645, 185], ['d14', 645, 370], ['d2', 0, 555], ['d3', 129, 555],
        ['d4', 258, 555], ['d5', 387, 555], ['d6', 516, 555], ['d7', 645, 555],
        ['d8', 774, 0], ['d9', 774, 185], ['h10', 0, 0], ['h11', 774, 555],
        ['h12', 903, 0], ['h13', 903, 185], ['h14', 903, 370], ['h2', 903, 555],
        ['h3', 0, 740], ['h4', 129, 740], ['h5', 258, 740], ['h6', 387, 740],
        ['h7', 516, 740], ['h8', 645, 740], ['h9', 774, 740], ['j0', 903, 740],
        ['s10', 1032, 0], ['s11', 1032, 185], ['s12', 1032, 370], ['s13', 1032, 555],
        ['s14', 1032, 740], ['s2', 0, 925], ['s3', 129, 925], ['s4', 258, 925],
        ['s5', 387, 925], ['s6', 516, 925], ['s7', 645, 925], ['s8', 774, 925],
        ['s9', 903, 925],
    ];

    function onCardImageLoad() {
        const cardWidth = 129, cardHeight = 185;
        const canvas = document.createElement('canvas');
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        const ctx = canvas.getContext('2d');
        const cssArray = [];
        cardData.forEach((data) => {
            const [cardIdf, x, y] = data;
            ctx.drawImage(imageObj,
                x, y, cardWidth, cardHeight,
                0, 0, cardWidth, cardHeight);
            const dataURI = canvas.toDataURL();
            cssArray.push(
                '.game-card-' + cardIdf + ' {' +
                '  background-image: url(' + dataURI + ');' +
                '}');
        });

        $("<style>")
            .prop("type", "text/css")
            .html(cssArray.join(''))
            .appendTo('head');

        if(cb) cb();
    }
};
