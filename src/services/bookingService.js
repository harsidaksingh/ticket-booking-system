const bookingRepo = require("../repos/bookingRepo");
const userRepo = require("../repos/userRepo");
const oracledb = require('oracledb')

const TICKET_PRICE = 50;

const createBooking = async (eventId, seatId, userEmail) => {
    let connection;
    try {
        connection = await oracledb.getConnection('oracleDB');

     
        const user = await userRepo.findUserForUpdate(connection, userEmail);
        if (!user) {
            console.error(`❌ User lookup failed for: "${userEmail}"`);
            throw new Error("User not found");
        }
        if (user.BALANCE < TICKET_PRICE) throw new Error("Insufficient Funds");

        await userRepo.chargeUser(connection, userEmail, TICKET_PRICE);
        console.log(`💳 Charged ${userEmail} $${TICKET_PRICE}`);

      
        const seat = await bookingRepo.getSeat(seatId);
        if (!seat || seat.STATUS !== 0) throw new Error("Seat already taken or invalid");

      
        await bookingRepo.updateSeatWithVersion(connection, eventId, seatId, userEmail, seat.VERSION);

     
        await connection.commit();
        console.log(`✅ Success: Seat ${seatId} booked for ${userEmail}`);

    } catch (error) {
        if (connection) await connection.rollback(); // Undo everything if ANY step fails
        console.error(`❌ Booking Failed: ${error.message}`);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
            console.log('🔌 DB Connection Closed');
        }
    }
}

const reserveSeat = async (eventId,seatId, userId) => {
    // 1. Validation Logic could go here (e.g., is seatId valid?)
    await bookingRepo.reserveSeat(eventId,seatId, userId);
    console.log(`✅ Seat ${seatId} reserved for ${userId}`);
}

module.exports = {
    createBooking,
    reserveSeat
};