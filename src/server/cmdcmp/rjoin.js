/**
 * Created by whyask37 on 2017. 2. 4..
 */

"use strict";

const cmdcmp = require('./cmdcmp');


cmdcmp.registerCompressor({
    type: 'rjoin',
    shead: 'J',
    cmpf: (obj) => {
        return 'J' + obj.username + '\0' + obj.useridf;
    },
    dcmpf: (s) => {
        const match = s.match(/^J(\w+)\0(\w+)$/);
        if(match === null) return null;
        return {
            type: 'rjoin',
            username: match[1],
            useridf: match[2]
        };
    }
});
