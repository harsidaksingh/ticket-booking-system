const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'ticket_user',
    password: process.env.DB_PASSWORD || 'ticket_password',
    connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1'
};

// Sample events to seed
const events = [
    { name: 'Coldplay: Music of the Spheres', seats: 120 },
    { name: 'AR Rahman Live in Concert', seats: 200 },
    { name: 'IPL Final 2025 — Mumbai vs Chennai', seats: 500 },
    { name: 'Standup Night with Zakir Khan', seats: 80 },
    { name: 'Ed Sheeran World Tour', seats: 150 },
    { name: 'Bollywood Retro Night', seats: 100 },
];

async function seed() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log('🔌 Connected. Starting seed...\n');

        for (const event of events) {
            // Insert event and get back the generated ID
            const result = await connection.execute(
                `INSERT INTO events (name, total_seats) VALUES (:name, :seats) RETURNING id INTO :id`,
                {
                    name: event.name,
                    seats: event.seats,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: false }
            );

            const eventId = result.outBinds.id[0];
            console.log(`✅ Created Event: "${event.name}" (ID: ${eventId})`);

            // Create seats for this event
            const seatsData = [];
            for (let i = 1; i <= event.seats; i++) {
                seatsData.push({ eventId, seatNum: i });
            }

            await connection.executeMany(
                `INSERT INTO seats (event_id, seat_number) VALUES (:eventId, :seatNum)`,
                seatsData,
                { autoCommit: false }
            );

            console.log(`   ↳ Created ${seatsData.length} seats\n`);
        }

        // Commit everything at once
        await connection.commit();
        console.log('🎉 All events and seats seeded successfully!');

    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        if (connection) await connection.rollback();
    } finally {
        if (connection) await connection.close();
    }
}

seed();
