/**
 * Created by whyask37 on 2017. 2. 5..
 */

const winston = require('winston');
const winstonError = require('winston-error');

require('date-utils');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
            level: 'debug'
        })
    ]
});

winstonError(logger);

global.logger = logger;
logger.info('Logging initialized');
