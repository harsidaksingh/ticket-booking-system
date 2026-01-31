const amqp = require('amqplib');

let channel;
const QUEUE_NAME = 'booking_queue';

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
        channel = await connection.createChannel();
        
        // Assert Queue: Makes sure the queue exists (creates it if not)
        await channel.assertQueue(QUEUE_NAME);
        console.log("🐰 Connected to RabbitMQ");
    } catch (error) {
        console.error("RabbitMQ Connection Failed", error);
    }
};

// 2. Helper to Send Messages (Producer)
const publishToQueue = async (data) => {
    if (!channel) await connectRabbitMQ();
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));
    console.log(`📥 Sent to Queue:`, data);
};

// 3. Helper to Read Messages (Consumer)
const consumeQueue = async (callback) => {
    if (!channel) await connectRabbitMQ();
    channel.consume(QUEUE_NAME, (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg); // Important: Tell RabbitMQ we finished processing
        }
    });
};

module.exports = { connectRabbitMQ, publishToQueue, consumeQueue };