const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
};

module.exports = requestLogger;
