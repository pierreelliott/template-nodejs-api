import {APP, LOGGER, SERVICE_PATH} from './configuration';
import * as fs from "fs";

export function registerServices() {
    retrieveServices().then((services) => {
        services.forEach((service) => {
            require("../services/"+ service); // Initialize it
        });
        console.log("All services registered.");
    }).catch((error) => {
        console.error(error);
    });
}

function retrieveServices() {
    return new Promise((resolve, reject) => {
        fs.readdir("." + SERVICE_PATH, (error, items) => {
            if(error) {
                console.error("Error while registering the services.");
                reject(error);
            } else {
                const services = items.filter((service) => service.endsWith(".js"));
                resolve(services);
            }
        })
    });
}


// FIXME Shouldn't be necessary anymore

/**
 * Register services on the API
 *
 * @param method Type of HTTP method (GET, POST, PUT, DELETE, ...)
 * @param path
 * @param handler
 * @param unauthenticated
 */
export function bindService(method, path, handler, unauthenticated) {
    LOGGER.info('Registering ' + method + ' ' + api.libRoot + path);
    // Enregistre la méthode
    // param 1 : (method = GET, POST, PUT, DELETE...,)
    // param 2 : le path de la méthode
    // param 3 : la méthode d'authenfication
    // param 4 : la fonction qui traite le requête (si authentifcation ok)
    if(unauthenticated) {
        (APP[method])(api.libRoot + path, filter);
    } else {
        (APP[method])(api.libRoot + path, passport.authenticate('basic', {
            session: false
        }), filter);
    }
}

/**
 *
 * @param req
 * @param res
 */
function filter(req, res) {
    // Fonction d'envoie des données
    // Param 1 : code HTTP de la réponse
    // Param 2 : données de réponse (object javascript)
    res.sendResponse = function(code, data, headers) {
        var responseBody = data;
        // Convertion des données en JSON
        if(!headers || !headers['Content-Type'] || headers['Content-Type'] == 'application/json') {
            responseBody = JSON.stringify(responseBody);
        }
        // La taille de la réponse (attention à bien le fait en UTF8 pour le calcul correct de la taille)
        var length = responseBody ? Buffer.byteLength(responseBody, 'utf8') : 0;
        // Code HTTP de la réponse (200, 400,...)
        // Ecriture des headers de la requête (content type, content length, exprises, Cache-Control, pragma)
        var defaultHeaders = {
            'Content-Type': 'application/json',
            'Content-Length': length,
            'Expires': '0',
            'Cache-Control': 'no-cache,no-store,private,must-revalidate,max-stale=0,post-check=0,pre-check=0,max-age=0',
            'Pragma': 'no-cache',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With,content-type,authorization'
        };
        if (headers) {
            for(var header in headers) {
                defaultHeaders[header] = headers[header];
            }
        }
        res.writeHead(code, defaultHeaders);
        // Ecriture de la réponse sur la sortie
        res.end(responseBody);
    };
    // Fonction de résponse avec un code 200 (OK)
    res.respond = function(data, headers) {
        res.sendResponse(200, data, headers);
    };
    // Fonction d'erreur
    res.error = function(code, data) {
        res.sendResponse(code, data);
    };
    // Initialise le body
    // A la base le body est vide et on le construit en lisant le stream (méthode on data)
    req.body = '';
    // Handler de la méthode erreur sur la requête entrante
    // Handler de la méthode data (rajout des données dans le body de la requête)
    // Handler de la méthode end (rajotu des données de fin dans le body de la requête)
    req.on('error', function(err) {
        logger.error(err);
    }).on('data', function(chunk) {
        req.body += chunk;
    }).on('end', function() {
        if (req.body) {
            try {
                // Convertion des données en assumant le format JSON
                req.body = JSON.parse(req.body);
            } catch (err) {
                // Si les données ne sont pas au format JSON on sort une erreur
                req.body = {};
                logger.error(err);
            }
        }
        if(unauthenticated) {
            handler(req, res);
        } else {
            try {
                // En se basant sur l'authorization (header http) on récupère en BDD l'utilisateur
                // et on le met dans la req.user afin qu'on puisse avoir l'utilisateur connecté tout le temps
                var authorization = req.get('Authorization');
                if (authorization.match(/^Basic [^ ]+$/)) {
                    authorization = new Buffer(authorization.replace(/^Basic ([^ ]+)$/, '$1'), 'base64').toString();
                    authorization = authorization.split(':')[0];
                    // On recherche l'utilisateur poru l'email
                    User.findOne({
                        email: authorization
                    }, function(err, user) {
                        if (err || !user) {
                            // Si on ne trouve pas l'utilisateur on renvoi une erreur
                            // Ce cas ne devrait pas pouvoir se produire car on vérifie l'authenfication en amoint (filter)
                            res.status(500).end(err ? err : 'User not found');
                        } else {
                            req.user = user;
                            try {
                                handler(req, res);
                            } catch (err) {
                                logger.error(err);
                                res.status(500).end(err);
                            }
                        }
                    });
                } else {
                    throw 'Bad authorization';
                }
            } catch (err) {
                logger.error(err);
                res.status(500).end(err);
            }
        }
    });
};

// Méthode qui lance l'enregistrement des méthodes de l'API en se basant sur le tableau methods
/*(function(methods) {
    for (var i = 0; i < methods.length; i++) {
        (function() {
            var index = i;
            var method = methods[index];
            api[method] = function(path, handler, unauthenticated) {
                api.service(method, path, handler, unauthenticated);
            };
        })();
    }
})(['get', 'post', 'put', 'delete']);
*/
