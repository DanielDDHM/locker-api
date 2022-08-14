const IORedis = require('ioredis');

const connectionIORedis = new IORedis({
  prefix: '{locker}:',
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

module.exports = connectionIORedis;