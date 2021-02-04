const { RedisPubSub } = require('graphql-redis-subscriptions');
const Redis = require('ioredis');
const {withFilter} = require('apollo-server-express');

const options = {
  retryStrategy: times => {
    return Math.min(times * 50, 2000);
  }
};

const pubsub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_URL, options),
  subscriber: new Redis(process.env.REDIS_URL, options)
});

module.exports= {
  pubsub,
  withFilter
};