const redis = require('redis')

// TODO: can promisify redis with bluebird https://www.npmjs.com/package/redis

module.exports = class {
  constructor(credentials) {
    this.client = redis.createClient(credentials);
  }

  hset(redisKey, hKey, hValue) {
    return new Promise((resolve, reject) => {
      this.client.hset(redisKey, hKey, hValue, this.onComplete(resolve, reject));
    });
  }

  hget(redisKey, hKey) {
    return new Promise((resolve, reject) => {
      this.client.hget(redisKey, hKey, this.onComplete(resolve, reject));
    })
  }

  hdel(redisKey, hKey) {
    return new Promise((resolve, reject) => {
      this.client.hdel(redisKey, hKey, this.onComplete(resolve, reject));
    })
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, this.onComplete(resolve, reject));
    })
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, this.onComplete(resolve, reject));
    })
  }

  // private
  onComplete(resolve, reject) {
    return ((err, result) => {
      if(err) return reject(err);
      else return resolve(result);
    });
  }
}
