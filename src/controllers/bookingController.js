const bookingService = require("../services/bookingService");
const { publishToQueue } = require("../config/rabbitmq");
const { getClient, getSubClient } = require("../config/redis");
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
  const orderId = await bookingService.createOrder(
    eventId,
    userEmail,
    seatIds,
    reqId,
  );
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

const getBookingStatusStream = async (req, res) => {
  const reqId = req.params.reqId;
  const client = getClient();
  const subClient = getSubClient();
  const channel = "booking:" + reqId;

  console.log(`SSE Client connected for booking: ${reqId}`);
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const status = await client.get(channel);
  if (status !== "PENDING") {
    res.write(`data: ${JSON.stringify({ status: status })}\n\n`);
    return res.end();
  }
  const listener = async (message) => {
    logger.info(`Sending SSE update: ${message}`);
    res.write(`data: ${JSON.stringify({ status: message })}\n\n`);
    res.end();
    await subClient.unsubscribe(channel, listener);
  };
  await subClient.subscribe(channel, listener);
  req.on("close", async () => {
    await subClient.unsubscribe(channel, listener);
  });
};

module.exports = {
  createBooking,
  reserve,
  getBookingStatus,
  getBookingStatusStream,
};
