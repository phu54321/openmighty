/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const cardShapes = ['spade', 'heart', 'clover', 'diamond', 'joker'];

function decodeCard(cardEnvID) {
    return {
        shape: cardShapes[(cardEnvID / 13) | 0],
        num: (cardEnvID == 52) ? 0 : (cardEnvID % 13) + 2,
        cardEnvID: cardEnvID
    };
}
exports.decodeCard = decodeCard;


exports.createJsonCompressor = function (stringHead, keys) {
    return function (obj) {
        const msg = [stringHead];
        keys.forEach(key => {
            if(key[0] == 'I') {
                msg.push(obj[key.substring(1)]);
            }
            else msg.push(obj[key]);
        });
        return msg.join('\0');
    };
};

exports.createJsonDecompressor  = function (type, keys) {
    return function (s) {
        const sList = s.split('\0');
        const obj = { type: type };
        let index = 1;
        keys.forEach(key => {
            if(key[0] == 'I') {
                obj[key.substring(1)] = sList[index] | 0;
            }
            else {
                obj[key] = sList[index];
            }
            index++;
        });
        return obj;
    };
};
