/**
 * Created by whyask37 on 2017. 2. 5..
 */

const winston = require('winston');
const winstonError = require('winston-error');

require('date-utils');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: () => new Date().toString(),
            colorize: true,
            level: 'debug'
        })
    ]
});

logger.stream = {
    write: function(message, encoding){
        logger.verbose(message.trim());
    }
};

winstonError(logger);

global.logger = logger;
logger.info('Logging initialized');

module.exports = logger;
