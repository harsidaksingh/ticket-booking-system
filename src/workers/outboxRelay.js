const mqService = require("../config/rabbitmq");
const { initializeDB } = require("../config/db");
const logger = require("../config/logger");
const bookingRepo = require("../repos/bookingRepo");
const { connectRedis } = require("../config/redis");
async function startRelay() {
  await initializeDB();
  await connectRedis();
  setInterval(async () => {
    const res = await bookingRepo.getPendingOutboxEvents();
    for (let row of res) {
      try {
        const payload = JSON.parse(row.PAYLOAD);
        await mqService.publishToQueue(payload);
        await bookingRepo.markOutboxEventsPublished(row.ID);
      } catch (error) {
        logger.error("Queue Publish faled for :", row.ID);
      }
    }
  }, 1000);
}
startRelay();
