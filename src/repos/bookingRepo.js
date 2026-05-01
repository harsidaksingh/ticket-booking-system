const oracledb = require("oracledb");
const { getClient } = require("../config/redis");
const logger = require("../config/logger");
const AppError = require("../utils/AppError");
const bookQuery = `insert into order_items (order_id,seat_id) values(:orderId,:seatId) RETURNING id INTO :id`;
const getSeatQuery = `select * from seats where id = :seatId`;
const updateSeatQueryWithVersion = `update seats set status=2, version=version+1 where id = :seatId and status IN (0,1) and version = :version`;
const reserveQuery = `update seats set status = 1,hold_id=:userId,expires_at= SYSDATE+interval '4' minute where id=:seatId and status = 0`;
const releaseQuery = `UPDATE seats SET status = 0, hold_id = NULL, expires_at = NULL,version=version+1 WHERE status = 1 AND expires_at < SYSDATE RETURNING event_id INTO :event_ids`;

const getSeat = async (seatId) => {
  let connection;
  try {
    connection = await oracledb.getConnection("oracleDB");
    const res = await connection.execute(
      getSeatQuery,
      { seatId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return res.rows[0];
  } catch (error) {
    logger.error(`Error in bookingRepo ${error}`);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
      // logger.info("Connection closed") // Optional: reduce noise
    }
  }
};

const updateSeatWithVersion = async (
  connection,
  eventId,
  seatId,
  orderId,
  version,
) => {
  try {
    const seatRes = await connection.execute(
      updateSeatQueryWithVersion,
      { seatId, version },
      { autoCommit: false },
    );
    if (seatRes.rowsAffected === 0) {
      logger.warn("Seat Already taken");
      throw new AppError("Seat Already Taken", 409);
    }
    await connection.execute(
      bookQuery,
      {
        orderId,
        seatId,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      },
      { autoCommit: false },
    );
    await invalidateCache(eventId);
    logger.info("Booking query executed");
  } catch (error) {
    logger.error(`Error in bookingRepo ${error}`);
    throw error;
  }
};

const reserveSeat = async (connection, eventId, seatId, userId) => {
  try {
    const res = await connection.execute(
      reserveQuery,
      { seatId, userId },
      { autoCommit: false },
    );
    if (res.rowsAffected === 0) {
      logger.warn("Seat Already taken");
      throw new AppError("Seat Already Taken", 409);
    }
    await invalidateCache(eventId);
  } catch (error) {
    logger.error(`Error in reserve seat ${error}`);
    throw error;
  }
};

const releaseExpireSeats = async () => {
  let connection;
  try {
    connection = await oracledb.getConnection("oracleDB");
    const res = await connection.execute(
      releaseQuery,
      { event_ids: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
      { autoCommit: true },
    );
    if (res.rowsAffected > 0) {
      const eventIds = res.outBinds.event_ids;
      const uniqueEvents = [...new Set(eventIds)];
      for (const eid of uniqueEvents) {
        await invalidateCache(eid);
      }
      logger.info(
        `♻️ Released ${res.rowsAffected} seats. Invalidated ${uniqueEvents.length} events.`,
      );
    }
  } catch (error) {
    logger.error(`Error in release seat ${error}`);
    throw error;
  } finally {
    await connection.close();
  }
};
const invalidateCache = async (eventId) => {
  const client = getClient();
  if (!client) return;
  try {
    await client.del(`seats:event:${eventId}`);
    logger.info(`🗑️ Invalidated Cache for Event ${eventId}`);
  } catch (e) {
    logger.error("Redis Invalidation Failed", e);
  }
};
const insertOrder = async (eventId, userEmail) => {
  let connection;
  try {
    connection = await oracledb.getConnection("oracleDB");
    const res = await connection.execute(
      `insert into orders(event_id,user_email,status,booking_time) Values(:eventId,:userEmail,'PENDING',SYSTIMESTAMP) RETURNING id INTO :id`,
      {
        eventId,
        userEmail,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      },
      { autoCommit: true },
    );
    logger.info("Order created Successfully");
    return res.outBinds.id[0];
  } catch (error) {
    logger.error(`Error in order creation ${error}`);
    throw error;
  } finally {
    await connection.close();
  }
};
const updateOrder = async (orderId, status) => {
  let connection;
  try {
    connection = await oracledb.getConnection("oracleDB");
    await connection.execute(
      `update orders set status = :status where id = :orderId `,
      { orderId, status },
      { autoCommit: true },
    );
  } catch (error) {
    logger.error("Error in orderUpdate");
  } finally {
    await connection.close();
  }
};
module.exports = {
  getSeat,
  updateSeatWithVersion,
  reserveSeat,
  releaseExpireSeats,
  insertOrder,
  updateOrder,
};
