const bookingService = require("../services/bookingService");
const { publishToQueue } = require("../config/rabbitmq");
const { getClient } = require("../config/redis");
const crypto = require("crypto");
const logger = require("../config/logger");

const createBooking = async (req, res) => {
  const { eventId, seatIds } = req.body;
  const userEmail = req.user.email;
  if (!eventId || !seatIds || !userEmail) {
    return res.status(400).json({
      message: "Invalid Request",
    });
  }
  const client = getClient();
  const reqId = crypto.randomUUID();

  await client.set("booking:" + reqId, "PENDING");
  const orderId = await bookingService.createOrder(eventId, userEmail);
  await publishToQueue({ eventId, seatIds, userEmail, reqId, orderId });
  logger.info(`RabbitMQ: Sent booking request ${reqId} to queue`);
  // 4. Return "Accepted" (202) immediately
  return res.status(202).json({
    message: "Booking request received. Processing in background.",
    reqId,
    status: "PENDING",
  });
};

const reserve = async (req, res) => {
  const { eventId, seatIds, userId } = req.body;
  if (!eventId || !seatIds || !userId) {
    return res.status(400).json({ message: "Invalid Request" });
  }
  await bookingService.reserveSeat(eventId, seatIds, userId);
  return res.status(200).json({ message: "Reserved!" });
};

const getBookingStatus = async (req, res) => {
  const { reqId } = req.params;
  if (!reqId) return res.status(400).json({ message: "Missing Request ID" });
  const client = getClient();
  const status = await client.get(`booking:${reqId}`);
  if (!status)
    return res.status(404).json({ message: "Booking Request Not Found" });
  return res.status(200).json({ reqId, status });
};

module.exports = {
  createBooking,
  reserve,
  getBookingStatus,
};
