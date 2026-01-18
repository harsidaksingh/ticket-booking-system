const oracledb = require('oracledb')
const bookQuery = `insert into bookings (event_id,seat_id,user_email) values(:eventId,:seatId,:userEmail) RETURNING id INTO :id`
const updateSeatQuery = `update seats set status=2 where id = :seatId and status = 0`

const createBooking = async (connection, eventId, seatId, userEmail) => {
    try {
        const seatRes = await connection.execute(updateSeatQuery, { seatId })
        if (seatRes.rowsAffected === 0) {
            console.warn("Seat Already taken")
            throw ("Seat Taken");
        }
        await connection.execute(bookQuery,
            { eventId, seatId, userEmail, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: false });
        console.log("Booking query executed");

        await connection.commit();
    } catch (error) {
        console.error(`Error in bookingRepo ${error}`);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
            console.log("Connection closed")
        }
    }
}

module.exports = {
    createBooking
}