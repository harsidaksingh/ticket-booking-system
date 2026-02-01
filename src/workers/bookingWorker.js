const mqService = require('../config/rabbitmq');
const bookingService = require('../services/bookingService');
const { initializeDB } = require('../config/db');
const { getClient, connectRedis } = require('../config/redis');

async function startWorker(){
    console.log("👷 Application Worker Starting...");

    await initializeDB();
    await connectRedis();
    const client = getClient();

    await mqService.consumeQueue(async (data) => {
        console.log(`👷 Processing booking for Seat ${data.seatId} / User ${data.userEmail}`);
        try{
            await bookingService.createBooking(data.eventId, data.seatId, data.userEmail);
            console.log("✅ Booking Successful!");
            await client.set("booking:"+data.reqId,"CONFIRMED")
        }catch (error) {
            console.error(`❌ Booking Failed: ${error.message}`);
            await client.set("booking:"+data.reqId,"FAILED")
        }
    })
}
startWorker();