const axios = require('axios');
const oracledb = require('oracledb');
require('dotenv').config();

const API_URL = 'http://localhost:3000/bookings';
const SEAT_ID = 50;

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

async function testOptimistic() {
    let conn;
    try {
        // 1. Reset seat to available and version 0
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(`UPDATE seats SET status = 0, version = 0 WHERE id = :SEAT_ID`, { SEAT_ID });
        
        // 2. Seed 10 test users with balance
        console.log("👥 Seeding 10 test users...");
        for (let i = 0; i < 10; i++) {
            const email = `optimist_${i}@test.com`;
            await conn.execute(
                `MERGE INTO users u USING dual ON (u.email = :email)
                 WHEN MATCHED THEN UPDATE SET balance = 100
                 WHEN NOT MATCHED THEN INSERT (name, email, balance) VALUES (:name, :email, 100)`,
                { name: `User ${i}`, email }
            );
        }
        
        await conn.commit();
        console.log(`🔄 Reset Seat ${SEAT_ID} and seeded users.`);
    } catch (err) {
        console.error("Reset failed:", err);
        return;
    } finally {
        if (conn) await conn.close();
    }

    console.log('🚀 Launching 10 concurrent Optimistic Booking requests...');
    
    const requests = [];
    for (let i = 0; i < 10; i++) {
        requests.push(
            axios.post(API_URL, {
                eventId: 1,
                seatId: SEAT_ID,
                userEmail: `optimist_${i}@test.com`
            }).then(r => ({ status: r.status, data: r.data }))
              .catch(err => ({ status: err.response?.status || 500, error: err.response?.data?.error }))
        );
    }

    const results = await Promise.all(requests);
    
    const successes = results.filter(r => r.status === 201);
    const failures = results.filter(r => r.status !== 201);

    console.log('\n--- OPTIMISTIC LOCK REPORT ---');
    console.log(`✅ Successes: ${successes.length}`);
    console.log(`❌ Failures: ${failures.length}`);
    
    if (successes.length === 1) {
        console.log('🛡️  SUCCESS: Optimistic locking worked! Only one user got the seat.');
    } else {
        console.error('🚨 FAILURE: Race condition detected! Multiple users booked the seat.');
    }
}

testOptimistic();
