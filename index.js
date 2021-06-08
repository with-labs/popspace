require("dotenv").config();
require("./init/init_global");

const fs = require('fs');
const https = require('https');
const express = require("express");
const app = express();
const port = process.env.PORT;

const loadSsl = () => {
  const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf8');
  const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8');
  return { key: privateKey, cert: certificate };
}

const server = https.createServer(loadSsl(), app);

app.get('/', (req, res) => res.send('non-api Hello World!'));
app.get('/api/*', (req, res) => res.send('api Hello World!'));
app.post('/', (req, res) => res.send('post Hello World'));

server.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
