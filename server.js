import express from 'express';
import { APP, PORT } from '/server/configuration';
import { requestLogger, errorLogger } from '/server/logger';

launchAPI();

function launchAPI() {
    // TODO Init logging

    // TODO Init API

    APP.use(requestLogger);
    APP.use(errorLogger);
    APP.listen(PORT);

    console.log('RESTful API server started on: ' + port);
}
