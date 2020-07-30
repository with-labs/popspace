const massive = require('massive');
const config = require('./config.js')
const monitor = require('pg-monitor');

module.exports = async () => {
  const db = await massive(config)
  monitor.attach(db.driverConfig);
  return db
}
