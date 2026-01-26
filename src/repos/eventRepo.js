const oracledb = require('oracledb');
const { getClient } = require('../config/redis');
const getEventQuery = `select * from events`;
const findAll = async () => {
    let connection;
    try {
        connection = await oracledb.getConnection('oracleDB');
        const result = await connection.execute(getEventQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

const getEventSeats = async (eventId) => {
    const client = getClient();
    const key = `seats:event:${eventId}`;
    // 1. Try Redis
    const cached = await client.get(key);
    if (cached) {
        console.log('⚡ Cache Hit');
        return JSON.parse(cached);
    }
    // 2. Fallback to Oracle
    console.log('🐢 Cache Miss - Querying DB');
    let connection;
    try {
        connection = await oracledb.getConnection('oracleDB');
        const result = await connection.execute(
            `SELECT * FROM seats WHERE event_id = :eventId ORDER BY seat_number`,
            [eventId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const seats = result.rows;
        // 3. Save to Redis
        await client.set(key, JSON.stringify(seats));
        
        return seats;
    } finally {
        if (connection) await connection.close();
    }
}
module.exports = {
    findAll,
    getEventSeats 
}