/**
 * Created by whyask37 on 2017. 2. 5..
 */

const winston = require('winston');
require('date-utils');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: function(){
                return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
            },
            colorize: true,
            level: 'debug'
        })
    ]
});

global.logger = logger;
logger.debug('Debug test');
