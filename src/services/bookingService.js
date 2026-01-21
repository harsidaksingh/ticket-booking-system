const bookingRepo = require("../repos/bookingRepo");
const userRepo = require("../repos/userRepo");
const oracledb = require('oracledb')

const TICKET_PRICE = 50;

const createBooking = async (eventId, seatId, userEmail) => {
    let connection;
    try {
        connection = await oracledb.getConnection('oracleDB');

        // 1. PESSIMISTIC LOCK: Lock user row to prevent double-spending
        const user = await userRepo.findUserForUpdate(connection, userEmail);
        if (!user) {
            console.error(`❌ User lookup failed for: "${userEmail}"`);
            throw new Error("User not found");
        }
        if (user.BALANCE < TICKET_PRICE) throw new Error("Insufficient Funds");

        // 2. PAYMENT: Deduct money (This happens inside the transaction)
        await userRepo.chargeUser(connection, userEmail, TICKET_PRICE);
        console.log(`💳 Charged ${userEmail} $${TICKET_PRICE}`);

        // 3. OPTIMISTIC GET: Fetch seat version
        const seat = await bookingRepo.getSeat(seatId);
        if (!seat || seat.STATUS !== 0) throw new Error("Seat already taken or invalid");

        // 4. BOOKING: Atomic update check version
        await bookingRepo.updateSeatWithVersion(connection, eventId, seatId, userEmail, seat.VERSION);

        // 5. COMMIT: Release all locks and finalize
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

module.exports = {
    createBooking // Keeping it simple
};