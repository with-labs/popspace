if (process.env.NODE_ENV != 'test') {
  throw 'NODE_ENV must be test';
}

module.exports = require('./test/_test');
