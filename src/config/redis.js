const redis = require("redis");

let client;
let subscribeClient;

const connectRedis = async () => {
  client = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  subscribeClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  subscribeClient.on("error", (err) =>
    console.log("Redis Subcribe Client Error", err),
  );

  await client.connect();
  await subscribeClient.connect();
  console.log("✅ Connected to Redis!");
};

const getClient = () => client;
const getSubClient = () => subscribeClient;

module.exports = { connectRedis, getClient, getSubClient };
