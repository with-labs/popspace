require("./init/init_global");

const express = require("express");
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => res.send('non-api Hello World!'));
app.get('/api/*', (req, res) => res.send('api Hello World!'));
app.post('/', (req, res) => res.send('post Hello World'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
