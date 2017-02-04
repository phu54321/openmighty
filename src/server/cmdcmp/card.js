/**
 * Created by whyask37 on 2017. 2. 4..
 */

const cardShapes = ['spade', 'heart', 'clover', 'diamond', 'joker'];

exports.decodeCard = function (cardEnvID) {
    "use strict";
    return {
        shape: cardShapes[(cardEnvID / 13) | 0],
        num: (cardEnvID == 52) ? 0 : (cardEnvID % 13) + 2,
        cardEnvID: cardEnvID
    };
};
