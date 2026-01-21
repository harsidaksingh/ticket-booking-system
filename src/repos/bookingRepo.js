const oracledb = require('oracledb')
const bookQuery = `insert into bookings (event_id,seat_id,user_email) values(:eventId,:seatId,:userEmail) RETURNING id INTO :id`
const getSeatQuery = `select * from seats where id = :seatId`
const updateSeatQueryWithVersion = `update seats set status=2 where id = :seatId and status = 0 and version = :version`

const getSeat = async (seatId) => {
    let connection;
    try {
        connection = await oracledb.getConnection('oracleDB');
        const res = await connection.execute(getSeatQuery, { seatId }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
        return res.rows[0];
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

const updateSeatWithVersion = async (connection, eventId, seatId, userEmail, version) => {
    try {
        const seatRes = await connection.execute(updateSeatQueryWithVersion, { seatId, version }, { autoCommit: false })
        if (seatRes.rowsAffected === 0) {
            console.warn("Seat Already taken")
            throw ("Seat Taken");
        }
        await connection.execute(bookQuery,
            { eventId, seatId, userEmail, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: false });
        console.log("Booking query executed");
    } catch (error) {
        console.error(`Error in bookingRepo ${error}`);
        throw error;
    }
}

module.exports = {
     getSeat, updateSeatWithVersion
}