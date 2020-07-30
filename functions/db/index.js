const AccountsRedis = require("./redis/accounts_redis")
const InitPg = require("./pg/init_pg")

module.exports = {
  redis: {
    AccountsRedis: AccountsRedis
  },
  pg: {
    init: InitPg
  }
}
