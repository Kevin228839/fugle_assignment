const Redis = require('ioredis');

const rateLimiter = async(req, res, next) => {
  const redisClient = new Redis();
  try {
    const userId = req.query.user;
    const userIp = req.ip;
    if(userId === undefined) {
      throw new Error("userId undefined");
    }
    const ts = Math.floor(Date.now() / 1000);
    let ipInfo = await redisClient.hgetall(userIp);
    let idInfo = await redisClient.hgetall(userId);
    if(Object.keys(ipInfo).length === 0) {
      await redisClient.hset(userIp, {
        createdAt: ts,
        count: 1
      });
    } else {
      if(parseInt(ipInfo.createdAt) - ts > 60) {
        await redisClient.hset(userIp, {
          createdAt: ts,
          count: 1
        });
      } else {
        await redisClient.hset(userIp, {
          count: parseInt(ipInfo.count) + 1
        });
      }
    }
    if(Object.keys(idInfo).length === 0) {
      await redisClient.hset(userId, {
        createdAt: ts,
        count: 1
      });
    } else {
      if(parseInt(idInfo.createdAt) - ts > 60) {
        await redisClient.hset(userId, {
          createdAt: ts,
          count: 1
        });
      } else {
        await redisClient.hset(userId, {
          count: parseInt(idInfo.count) + 1
        });
      }
    }
    ipInfo = await redisClient.hgetall(userIp);
    idInfo = await redisClient.hgetall(userId);
    if(parseInt(ipInfo.count) > 10 || parseInt(idInfo.count) > 5) {
      return res.status(429).json({
        ip: ipInfo.count,
        id: idInfo.count
      })
    } else {
      return next();
    }
  } catch(err) {
    next(err);
  } finally {
    redisClient.disconnect();
  }
}

module.exports = rateLimiter;