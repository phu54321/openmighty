/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const compressMap = {};
const decompressMap = {};
const utils = require('./utils');



function defaultCompressor(obj) {
    // For array
    if(Array.isArray(obj)) {
        if(obj.length === 0) return [];
        // Array holding array
        else if(obj[0].cardEnvID !== undefined) {
            return ['*'].concat(obj.map(c => c.cardEnvID));
        }
        else return obj.map(defaultCompressor);
    }

    // For object
    else if(typeof(obj) == 'object') {
        const compressed = {};

        Object.keys(obj).forEach(key => {
            // Compress card only
            if(obj[key] === undefined) {}
            else if(obj[key] === null) {
                compressed[key] = null;
            }
            else if (obj[key].cardEnvID !== undefined) {
                compressed['*' + key] = obj[key].cardEnvID;
            }
            else {
                compressed[key] = defaultCompressor(obj[key]);
            }
        });

        return compressed;
    }

    // Else -> pass as-is
    else return obj;
}

function defaultDecompressor(obj) {
    // Array
    if(Array.isArray(obj)) {
        if(obj.length === 0) return [];
        else if(obj[0] == '*') {
            return obj.slice(1).map(utils.decodeCard);
        }
        else return obj.map(defaultDecompressor);
    }

    else if(typeof(obj) == 'object') {
        const decompressed = {};

        Object.keys(obj).forEach(key => {
            if(key[0] == '*') {
                decompressed[key.substr(1)] = utils.decodeCard(obj[key]);
            }
            else {
                decompressed[key] = defaultDecompressor(obj[key]);
            }
        });

        return decompressed;
    }

    // Else -> return as-is
    else return obj;
}


/**
 * Compress command object to string
 * @param cmd
 * @returns {*}
 */
exports.compressCommand = function (cmd) {
    if(typeof(cmd) == 'string') return cmd;  // Already compressed
    const cmpFunc = compressMap[cmd.type];
    return cmpFunc ? cmpFunc(cmd) : defaultCompressor(cmd);
};


/**
 * Decompress command object from string
 * @param cmd
 * @returns {*}
 */
exports.decompressCommand = function (cmd) {
    if(typeof(cmd) != 'string') return defaultDecompressor(cmd);
    const dcmpFunc = decompressMap[cmd[0]];
    return dcmpFunc ? (dcmpFunc(cmd) || cmd) : defaultDecompressor(cmd);
};


/**
 * Register compressor to table
 */
exports.registerCompressor = function (obj) {
    const cmdType = obj.type;
    const stringHead = obj.shead;
    const cmpf = obj.cmpf;
    const dcmpf = obj.dcmpf;

    if(
        compressMap[cmdType] || decompressMap[stringHead]
    ) throw new Error('Duplicate compressor ' + cmdType + " " +stringHead);
    compressMap[cmdType] = cmpf;
    decompressMap[stringHead] = dcmpf;
};

// Add compressor here
require('./room');
require('./ginit');

