import express from 'express';
import configFile from '/config/config';
import configFileDev from '/config/config.dev';

// TODO Determine which config file is used based on arguments from console startup
const config = false ? configFile : configFileDev;

/**
 * Available through the entire server with `import { APP } from '/server/configuration';`
 * @type {app} Express Application
 */
export const APP = express();

// FIXME
export const LOGGER = {
    info() {},
    error() {}
};

/**
 * Environment being deployed (can be DEV or PROD)
 * @type {string}
 */
export const ENV = config.env ? config.env.toString().toUpperCase() : "DEV";

/**
 * Base domain of the API. Defaults to "localhost" if missing
 * @type {string}
 */
export const BASEDOMAIN = config.domain || "localhost";

export const PORT = config.port || "3000";
