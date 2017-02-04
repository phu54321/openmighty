/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const cmdcmp = require('./cmdcmp');
const utils = require('./utils');

cmdcmp.registerCompressor({
    type: 'pcp',
    shead: 'C',
    keys: ['Iplayer', 'Ccard', 'Bjcall']
});

cmdcmp.registerCompressor({
    type: 'tend',
    shead: 'T',
    keys: ['winner']
});
