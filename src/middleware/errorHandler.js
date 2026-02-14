const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.message}`, { 
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: message,
        status: 'error'
    });
};

module.exports = errorHandler;
