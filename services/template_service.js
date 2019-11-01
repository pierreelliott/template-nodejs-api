import {APP} from "../server/configuration";

APP.get("/hello", (req, res, next) => {
    return hello()
        .then((response) => {
            res.respond(response);
        })
        .catch((error) => {
            next('Typical server error.');
        });
});

export function hello() {
    return new Promise((resolve, reject) => {
        resolve("Hello");
    });
}
