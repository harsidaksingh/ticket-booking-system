const bookingRepo = require("../repos/bookingRepo");
const userRepo = require("../repos/userRepo");
const oracledb = require("oracledb");
const AppError = require("../utils/AppError");

const createBooking = async (eventId, seatIds, userEmail, orderId) => {
  let connection;
  try {
    connection = await oracledb.getConnection("oracleDB");
    for (let seatId of seatIds) {
      const seat = await bookingRepo.getSeat(seatId);
      console.log(
        `[DEBUG] Booking Check: Seat=${seatId}, Status=${seat.STATUS}, HoldID=${seat.HOLD_ID}, User=${userEmail}`,
      );
      const isAvailable =
        seat.STATUS === 0 || (seat.STATUS === 1 && seat.HOLD_ID === userEmail);
      if (!seat || !isAvailable)
        throw new AppError("Seat already taken or invalid", 409);
      await bookingRepo.updateSeatWithVersion(
        connection,
        eventId,
        seatId,
        orderId,
        seat.VERSION,
      );
    }
    await connection.commit();
    console.log(`✅ Success: booked for ${userEmail}`);
    await bookingRepo.updateOrder(orderId, "CONFIRMED");
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`❌ Booking Failed: ${error.message}`);
    await bookingRepo.updateOrder(orderId, "FAILED");
    throw error;
  } finally {
    if (connection) {
      await connection.close();
      console.log("🔌 DB Connection Closed");
    }
  }
};
const createOrder = async (eventId, userEmail) => {
  try {
    const orderId = await bookingRepo.insertOrder(eventId, userEmail);
    return orderId;
  } catch (error) {
    logger.error(`Error in createOrder ${error}`);
    throw error;
  }
};
const reserveSeat = async (eventId, seatIds, userId) => {
  let connection;
  try {
    connection = await oracledb.getConnection("oracleDB");
    for (let seatId of seatIds) {
      await bookingRepo.reserveSeat(connection, eventId, seatId, userId);
    }
    await connection.commit();
    console.log(`✅ ${seatIds.length} Seat(s) reserved for ${userId}`);
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`❌ Reserve Failed: ${error.message}`);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
      console.log("🔌 DB Connection Closed");
    }
  }
};

module.exports = {
  createBooking,
  reserveSeat,
  createOrder,
};
