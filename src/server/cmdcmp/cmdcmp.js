/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const compressMap = {};
const decompressMap = {};


/**
 * Compress command object to string
 * @param cmd
 * @returns {*}
 */
exports.compressCommand = function (cmd) {
    if(cmd instanceof String) return cmd;  // Already compressed
    const cmpFunc = compressMap[cmd.type];
    return cmpFunc ? cmpFunc(cmd) : cmd;
};


/**
 * Decompress command object from string
 * @param cmd
 * @returns {*}
 */
exports.decompressCommand = function (cmd) {
    if(typeof(cmd) != 'string') return cmd;
    const dcmpFunc = decompressMap[cmd[0]];
    return dcmpFunc ? (dcmpFunc(cmd) || cmd) : cmd;
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
require('./rjoin');

