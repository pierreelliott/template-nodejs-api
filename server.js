import { APP, PORT } from './server/configuration';
import { requestLogger, errorLogger } from './server/logger';
import { registerServices } from "./server/api";

launchAPI();

function launchAPI() {
    // TODO Init logging

    // TODO Init API

    APP.use(requestLogger);
    APP.use(errorLogger);

    APP.use(errorHandler);

    APP.listen(PORT);

    registerServices();

    console.log('RESTful API server started on: ' + PORT);
}

function errorHandler (err, req, res, next) {
    console.error(err.stack);
    console.warn(err);
    res.status(500).send('Something broke!');
}
