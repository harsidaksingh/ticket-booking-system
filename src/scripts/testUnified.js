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

async function testAsyncFlow() {
    let conn;
    try {
        console.log("🔌 Connecting to DB...");
        conn = await oracledb.getConnection(dbConfig);
        
        // 1. Reset SEAT 50 (Available, Version 0) & Clear Bookings
        console.log("🧹 Cleaning up old data...");
        await conn.execute(`UPDATE seats SET status = 0, version = 0 WHERE id = :SEAT_ID`, { SEAT_ID });
        await conn.execute(`DELETE FROM bookings WHERE seat_id = :SEAT_ID`, { SEAT_ID });
        
        // 2. Reset Users (Give them all $1000 balance)
        console.log("👥 Seeding 10 test users...");
        for (let i = 0; i < 10; i++) {
            const email = `async_${i}@test.com`;
            await conn.execute(
                `MERGE INTO users u USING dual ON (u.email = :email)
                 WHEN MATCHED THEN UPDATE SET balance = 1000
                 WHEN NOT MATCHED THEN INSERT (name, email, balance) VALUES (:name, :email, 1000)`,
                { name: `AsyncUser ${i}`, email }
            );
        }
        await conn.commit();
    } catch (err) {
        console.error("Setup failed:", err);
        return;
    }

    console.log('🚀 Launching 10 concurrent ASYNC Booking requests...');
    
    // 3. Fire Requests
    const requests = [];
    for (let i = 0; i < 10; i++) {
        requests.push(
            axios.post(API_URL, {
                eventId: 1,
                seatId: SEAT_ID,
                userEmail: `async_${i}@test.com`
            }).then(r => ({ status: r.status, email: `async_${i}@test.com` }))
              .catch(err => ({ status: err.response?.status || 500, error: err.message }))
        );
    }

    const results = await Promise.all(requests);
    
    // 4. Check API Responses (Should be 202 Accepted)
    const accepted = results.filter(r => r.status === 202).length;
    console.log(`\n📮 API Results: ${accepted}/10 requests Accepted (202).`);

    if (accepted !== 10) {
        console.error("🚨 API did not accept all requests!");
    } else {
        console.log("✅ API layer looks good. Initializing wait for Worker...");
    }

    // 5. Wait for Worker (Poll DB)
    console.log("⏳ Waiting 5 seconds for background worker...");
    await new Promise(r => setTimeout(r, 5000));

    // 6. Verify Final DB State
    try {
        const result = await conn.execute(
            `SELECT count(*) as count FROM bookings WHERE seat_id = :SEAT_ID`, 
            { SEAT_ID }
        );
        const bookingCount = result.rows[0][0]; // Oracle returns array of arrays by default
        
        const seatResult = await conn.execute(
            `SELECT status, version FROM seats WHERE id = :SEAT_ID`,
            { SEAT_ID },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const seat = seatResult.rows[0];

        console.log('\n--- FINAL VERIFICATION REPORT ---');
        console.log(`📊 Total Bookings in DB: ${bookingCount}`);
        console.log(`💺 Final Seat Status: ${seat.STATUS} (Should be 2)`);
        console.log(`🔢 Final Seat Version: ${seat.VERSION} (Should be > 0)`);

        if (bookingCount === 1 && seat.STATUS === 2) {
            console.log('�️  SUCCESS: System handled high concurrency correctly! Only 1 booking made.');
        } else {
            console.log('🚨 FAILURE: Race condition detected or Worker failed.');
        }

    } catch (err) {
        console.error("Verification failed", err);
    } finally {
        if (conn) await conn.close();
    }
}

testAsyncFlow();
