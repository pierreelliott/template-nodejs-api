import { hello } from './template_service';

const app = global.app;

app.get("/hello", (req, res) => {
    return hello()
        .then((response) => {
            res.respond(response);
        })
        .catch((error) => {
            res.error(500, {error: 'Typical server error.'});
        });
});
