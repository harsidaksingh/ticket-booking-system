const bookingRepo = require("../repos/bookingRepo");
const userRepo = require("../repos/userRepo");
const oracledb = require('oracledb')

const TICKET_PRICE = 50;

// Helper to simulate network delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const bookSeat = async (eventId, seatId, userEmail) => {
    await bookingRepo.createBooking(eventId, seatId, userEmail);
}

const bookWithPayment = async (eventId, seatId, userEmail) => {
    let connection;
    try {
        // 1. Check Balance
        connection = await oracledb.getConnection('oracleDB');
        const user = await userRepo.findUserForUpdate(connection, userEmail);
        if (!user) throw new Error("User not found");

        if (user.BALANCE < TICKET_PRICE) {
            throw new Error("Insufficient Funds");
        }

        console.log(`💰 ${userEmail} has enough money. Proceeding to payment gateway...`);

        // 2. THE TRAP: Simulate slow Bank API
        await sleep(2000);

        // 3. Charge User
        await userRepo.chargeUser(connection, userEmail, TICKET_PRICE);
        console.log(`💳 Charged ${userEmail} $${TICKET_PRICE}`);

        // 4. Book Seat
        await bookingRepo.createBooking(connection, eventId, seatId, userEmail);
        connection.commit();
    } catch (error) {
        console.error(`Error in booking Service: ${error}`);
        throw new Error(error.message);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
    }
}

module.exports = {
    bookSeat,
    bookWithPayment // Export the new function
};