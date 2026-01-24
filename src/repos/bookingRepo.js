const oracledb = require('oracledb')
const bookQuery = `insert into bookings (event_id,seat_id,user_email) values(:eventId,:seatId,:userEmail) RETURNING id INTO :id`
const getSeatQuery = `select * from seats where id = :seatId`
const updateSeatQueryWithVersion = `update seats set status=2, version=version+1 where id = :seatId and status = 0 and version = :version`
const reserveQuery = `update seats set status = 1,hold_id=:userId,expires_at= SYSDATE+interval '2' minute where id=:seatId and status = 0`
const releaseQuery = `UPDATE seats SET status = 0, hold_id = NULL, expires_at = NULL WHERE status = 1 AND expires_at < SYSDATE`

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

const reserveSeat = async (seatId,userId) => {
    let connection;
    try{
        connection = await oracledb.getConnection('oracleDB');
        const res = await connection.execute(reserveQuery,{seatId,userId},{autoCommit:true})
        if (res.rowsAffected === 0) {
            console.warn("Seat Already taken")
            throw ("Seat Taken");
        }
    }catch(error){
        console.error(`Error in reserve seat ${error}`);
        throw error;
    }finally{
        await connection.close();
        console.log("connection closed")
    }

}

const releaseExpireSeats = async () => {
    let connection;
    try{
        connection = await oracledb.getConnection('oracleDB');
        const res = await connection.execute(releaseQuery,[],{autoCommit:true})
    }catch(error){
        console.error(`Error in release seat ${error}`);
        throw error;
    }finally{
        await connection.close();
    }

}

module.exports = {
     getSeat, updateSeatWithVersion,reserveSeat,releaseExpireSeats
}