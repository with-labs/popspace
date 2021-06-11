const redis = require('redis')
const moment = require("moment")

module.exports = class {
  constructor(credentials) {
    console.log("Connecting to redis...")
    this.client = redis.createClient(credentials);
    this.client.on("error", (error) => {
      console.log("Error initializing redis", error)
    })
  }

  async enqueue(key, data) {
    return new Promise((resolve, reject) => {
      /*
        Push on the left so it's easier to peek -
        peeking is looking at the 0th element this way,
        vs having to figure out the length/size in the off-case.
      */
      this.client.lpush(key, data, this.onComplete(resolve, reject));
    })
  }

  async dequeue(key) {
    return new Promise((resolve, reject) => {
      this.client.rpop(key, this.onComplete(resolve, reject));
    })
  }

  /*
    This queue is not 100% accurate.

    The queue order is based on server timestamp, which is inaccurate in general.

    It's possible to make a slow, guaranteed-order queue,
    if we stored an index in a redis value, and incremented it each insert,
    and used it for the zset score.
  */
  async enqueueUnique(key, value) {
    return this.zadd(key, Date.now(), value)
  }

  async dequeueUnique(key) {
    return new Promise((resolve, reject) => {
      this.client.zpopmin(key, this.onComplete(resolve, reject))
    })
  }

  /*
    This will dequeue a value and atomically write it
    to an indermediate store.

    This is useful, for example, for processing elements
    in a redis queue. If the processing process dies
    after an element is dequeued, and before it is processed -
    it is lost forever.

    If we store it in the intermediate stash, we have a chance of
    recovering, and processing it.

    We'd still want to figure out if it was indeed successfully processed,
    but after that the intermediate store was not cleared.

    returns the dequeued value
  */
  async carefulDequeueUnique(key) {
    return this.moveAndFetch(key, this.intermediateStoreKey(key))
  }

  async finishCarefulDequeue(key, value) {
    return this.moveAndFetch(this.intermediateStoreKey(key), this.finishedStoreKey(key), value)
  }

  async moveAndFetch(fromKey, toKey, value=null) {
    return new Promise((resolve, reject) => {
      this.client.watch(fromKey, async (watchError) => {
        if(watchError) {
          throw watchError
        }

        if(value == null) {
          value = await this.zpeek(fromKey)
        }
        if(!value) {
          throw "Empty zset"
        }
        const score = await this.zscore(fromKey, value)
        /*
          atomically moves the next value from the
          zset to the intermediate store.
        */
        this.client.multi()
          .zrem(fromKey, value)
          .zadd(toKey, score, value)
          .exec((error, result) => {
            if(error) {
              reject(error)
            } else {
              resolve(value)
            }
          })
      })
    })
  }

  /*
    Shows the element with the greatest score,
    w/o popping it.
  */
  async zpeek(key) {
    return new Promise((resolve, reject) => {
      this.client.zrange(key, 0, 0, ((err, result) => {
        if(err) return reject(err);
        else return resolve(result[0]);
      }))
    })
  }

  /*
    Returns cardinality/total number of members
  */
  async zcard(key) {
    return new Promise((resolve, reject) => {
      this.client.zcard(key, this.onComplete(resolve, reject))
    })
  }

  /*
    Returns score of one element in zset
  */
  async zscore(key, value) {
    return new Promise((resolve, reject) => {
      this.client.zscore(key, value, this.onComplete(resolve, reject))
    })
  }

  async zmembers(key, withScores) {
    return new Promise((resolve, reject) => {
      if(withScores) {
        this.client.zrange(key, 0, -1, 'withscores', (err, result) => {
          if(err) return reject(err);
          else return resolve(result);
        })
      } else {
        this.client.zrange(key, 0, -1, this.onComplete(resolve, reject))
      }
    })
  }

  async zcount(key, min='-inf', max='inf') {
    return new Promise((resolve, reject) => {
      this.client.zcount(key, min, max, this.onComplete(resolve, reject))
    })
  }

  async zadd(key, score, value) {
    return new Promise((resolve, reject) => {
      this.client.zadd(key, score, value, this.onComplete(resolve, reject))
    })
  }

  async zrem(key, value) {
    return new Promise((resolve, reject) => {
      this.client.zrem(key, value, this.onComplete(resolve, reject))
    })
  }

  async zismember(key, value) {
    return new Promise((resolve, reject) => {
      this.client.zscore(key, value, ((err, result) => {
        if(err) return reject(err);
        else return resolve(result);
      }))
    })
  }

  async hset(key, hKey, hValue) {
    return new Promise((resolve, reject) => {
      this.client.hset(key, hKey, hValue, this.onComplete(resolve, reject))
    })
  }

  async hget(key, hKey) {
    return new Promise((resolve, reject) => {
      this.client.hget(key, hKey, this.onComplete(resolve, reject))
    })
  }

  async hdel(key, hKey) {
    return new Promise((resolve, reject) => {
      this.client.hdel(key, hKey, this.onComplete(resolve, reject));
    })
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, this.onComplete(resolve, reject));
    })
  }

  async sadd(key, value) {
    return new Promise((resolve, reject) => {
      this.client.sadd(key, value, this.onComplete(resolve, reject))
    })
  }

  async srem(key, value) {
    return new Promise((resolve, reject) => {
      this.client.srem(key, value, this.onComplete(resolve, reject))
    })
  }

  async spop(key, count=1) {
    return new Promise((resolve, reject) => {
      this.client.spop(key, count, this.onComplete(resolve, reject))
    })
  }

  async smembers(key) {
    return new Promise((resolve, reject) => {
      this.client.smembers(key, this.onComplete(resolve, reject))
    })
  }

  async set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, this.onComplete(resolve, reject));
    })
  }

  async get(key) {
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

  intermediateStoreKey(key) {
    return `${key}__dequeued___`
  }

  finishedStoreKey(key) {
    return `${key}__finished___`
  }
}
