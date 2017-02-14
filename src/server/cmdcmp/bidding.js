/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const cmdcmp = require('./cmdcmp');
const utils = require('./utils');

// {"type":"binfo","president":0,"shape":"clover","num":13}
cmdcmp.registerCompressor({
    type: 'binfo',
    shead: 'B',
    keys: ['Ipresident', 'shape', 'Inum']
});

// {"type":"pbinfo","bidder":3,"bidShape":"pass"}
cmdcmp.registerCompressor({
    type: 'pbinfo',
    shead: 'p',
    keys: ['Ibidder', 'bidShape', 'IbidCount']
});
