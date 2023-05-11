/* eslint-disable */

/**
 * This is a simple production server
 * for the frontend Noodle app.
 */

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const useSsl = !!process.env.SSL_PRIVATE_KEY_PATH;
const loadSsl = () => {
  const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf8');
  const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8');
  console.log(`Loaded SSL certificate from ${process.env.SSL_CERTIFICATE_PATH}`);
  return { key: privateKey, cert: certificate };
};

const app = express();

app.use(express.static('build'));
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'build' });
});
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'build' });
});

let server;
if (useSsl) {
  server = https.createServer(loadSsl(), app);
} else {
  server = http.createServer(app);
}

server.listen(process.env.APP_PORT || 8888, () => {
  console.log(`Server live on http${useSsl ? 's' : ''}://localhost:${process.env.APP_PORT || 8888}`);
});
