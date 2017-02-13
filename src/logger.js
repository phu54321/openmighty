/**
 * Created by whyask37 on 2017. 2. 5..
 */

const winston = require('winston');
const winstonError = require('winston-error');

require('date-utils');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: () => {
                const currentTime = new Date();

                const yyyy = currentTime.getFullYear();
                const mm = currentTime.getMonth() < 9 ? "0" + (currentTime.getMonth() + 1) : (currentTime.getMonth() + 1); // getMonth() is zero-based
                const dd  = currentTime.getDate() < 10 ? "0" + currentTime.getDate() : currentTime.getDate();
                const hh = currentTime.getHours() < 10 ? "0" + currentTime.getHours() : currentTime.getHours();
                const min = currentTime.getMinutes() < 10 ? "0" + currentTime.getMinutes() : currentTime.getMinutes();
                const ss = currentTime.getSeconds() < 10 ? "0" + currentTime.getSeconds() : currentTime.getSeconds();
                const ms = ("000" + currentTime.getMilliseconds()).substr(-3);
                return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}.${ms}KST`;
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
