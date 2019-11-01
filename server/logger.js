import winston from 'winston';

const remoteLogFactory = ({host, port, path}) => {
    return new winston.transports.Http({
        host: host || "localhost",
        port: port || 80,
        path: path || "/logs"
    })
};

const consoleLog = new winston.transports.Console();

export const requestLogger = createRequestLogger([consoleLog]);
export const errorLogger = createErrorLogger([consoleLog]);
export const LOGGER = {};

function createRequestLogger(transports) {
    const requestLogger = winston.createLogger({
        format: getRequestLogFormatter(),
        transports: transports
    });

    return function logRequest(req, res, next) {
        requestLogger.info({req, res});
        next();
    }
}

function createErrorLogger(transports) {
    const errLogger = winston.createLogger({
        level: 'error',
        transports: transports
    });

    return function logError(err, req, res, next) {
        errLogger.error({err, req, res});
        next();
    }
}

function getRequestLogFormatter() {
    const {combine, timestamp, printf} = winston.format;

    return combine(
        timestamp(),
        printf(info => {
            const {req, res} = info.message;
            return `${info.timestamp} ${info.level}: ${req.hostname}${req.port || ''}${req.originalUrl}`;
        })
    );
}
