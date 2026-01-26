const redis = require('redis');

let client;

const connectRedis = async () => {
    client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => console.log('Redis Client Error', err));
    
    await client.connect();
    console.log('✅ Connected to Redis!');
};

const getClient = () => client;

module.exports = { connectRedis, getClient };
