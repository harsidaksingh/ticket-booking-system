const mqService = require('../config/rabbitmq');
const bookingService = require('../services/bookingService');
const { initializeDB } = require('../config/db');
const { getClient, connectRedis } = require('../config/redis');
const logger = require('../config/logger');

async function startWorker(){
    logger.info("👷 Application Worker Starting...");

    await initializeDB();
    await connectRedis();
    const client = getClient();

    await mqService.consumeQueue(async (data) => {
        logger.info(`👷 Processing booking for Seat ${data.seatId} / User ${data.userEmail}`);
        try{
            await bookingService.createBooking(data.eventId, data.seatId, data.userEmail);
            logger.info("✅ Booking Successful!");
            await client.set("booking:"+data.reqId,"CONFIRMED")
        }catch (error) {
            logger.error(`❌ Booking Failed: ${error.message}`);
            await client.set("booking:"+data.reqId,"FAILED")
        }
    })
}
startWorker();