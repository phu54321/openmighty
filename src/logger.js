/**
 * Created by whyask37 on 2017. 2. 5..
 */

const winston = require('winston');
const winstonError = require('winston-error');
const utils = require('./utils');

require('date-utils');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: () => {
                const currentTime = new Date();
                return utils.formatTime(currentTime);
            },
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
