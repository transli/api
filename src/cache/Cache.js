const Redis = require('ioredis');

class Cache {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL, {
      keyPrefix: 'cache:',
    });
  }

  async set(key, value, hrs) {
    return this.redis.set(key, JSON.stringify(value), 'EX', 60 * 60 * hrs ? hrs : 6, err => {
      if(err){
        console.log(err);
      }
    });
  }

  async get(key) {
    const cached = await this.redis.get(key);

    return cached ? JSON.parse(cached) : null;
  }

  // Invalidating the cache by a unique key
  invalidate(key) {
    return this.redis.del(key);
  }

  // Invalidating the cache by a prefix of a structure key
  async invalidatePrefix(prefix) {
    // Finding the structure keys by the passed prefix
    const keys = await this.redis.keys(`cache:${prefix}:*`);

    const keysWithoutPrefix = keys.map(key => key.replace('cache:', ''));

    return this.redis.del(keysWithoutPrefix);
  }
}

module.exports = new Cache();
