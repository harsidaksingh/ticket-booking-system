const oracledb = require('oracledb');
require('dotenv').config();
const dbConfig = {
    user: process.env.DB_USER || 'ticket_user',
    password: process.env.DB_PASSWORD || 'ticket_password',
    connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1'
};

async function seed() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log('🔌 Connected. Seeding...');
        const result = await connection.execute(
            `INSERT INTO events (name, total_seats) VALUES (:name, :seats) RETURNING id INTO :id`,
            { name: 'Coldplay Concert', seats: 100, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: false });

        const eventId = result.outBinds.id[0];
        console.log(`✅ Created Event: Coldplay (ID: ${eventId})`);
        const seatsData = [];
        for (let i = 1; i <= 100; i++) {
            seatsData.push({ eventId: eventId, seatNum: i });
        }
        await connection.executeMany(
            `INSERT INTO seats (event_id, seat_number) VALUES (:eventId, :seatNum)`,
            seatsData,
            { autoCommit: true }
        );
        console.log(`✅ Created ${seatsData.length} seats`);
    } catch (error) {
        console.error('Failed to seed:', error);
    } finally {
        if (connection) await connection.close();
    }
}
seed();