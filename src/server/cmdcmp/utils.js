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


const typeEncodeTable = {
    'C': {
        enc: (c) => c.cardEnvID,
        dec: (c) => decodeCard(c)
    },
    'F': {
        enc: (c) => c,
        dec: (c) => Number(c)
    },
    'I': {
        enc: (c) => c,
        dec: (c) => c | 0
    },
    'B': {
        enc: (c) => c | 0,
        dec: Boolean
    }
};

exports.createJsonCompressor = function (stringHead, keys) {
    return function (obj) {
        const msg = [];
        keys.forEach(key => {
            const typeEncoder = typeEncodeTable[key[0]];
            if(typeEncoder) {
                msg.push(typeEncoder.enc(obj[key.substring(1)]));
            }
            else msg.push(obj[key]);
        });
        return stringHead + msg.join(';');
    };
};

exports.createJsonDecompressor  = function (type, keys) {
    return function (s) {
        const sList = s.substr(1).split(';');
        const obj = { type: type };
        let index = 0;
        keys.forEach(key => {
            const typeEncoder = typeEncodeTable[key[0]];
            if(typeEncoder) {
                obj[key.substring(1)] = typeEncoder.dec(sList[index]);
            }
            else {
                obj[key] = sList[index];
            }
            index++;
        });
        return obj;
    };
};
