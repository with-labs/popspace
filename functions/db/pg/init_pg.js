const massive = require('massive');
const config = require('./config.js')
const monitor = require('pg-monitor');

let db = null

module.exports = async () => {
  if(db) {
    return db
  }
  db = await massive(config)
  monitor.attach(db.driverConfig);
  return db
}
