const axios = require('axios');
const oracledb = require('oracledb');
require('dotenv').config();

const API_URL = 'http://localhost:3000/bookings';
const SEAT_ID = 55;

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testReservation() {
    let conn;
    try {
        console.log('🔄 Resetting Seat 55...');
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(`UPDATE seats SET status = 0, hold_id = NULL, expires_at = NULL WHERE id = :id`, [SEAT_ID]);
        await conn.commit();
    } catch (err) {
        console.error("Setup failed:", err);
        return;
    }

    console.log('\n--- TEST 1: Basic Reservation ---');
    try {
        const res1 = await axios.post(`${API_URL}/reserve`, { seatId: SEAT_ID, userId: 'user123' });
        if (res1.status === 200) console.log('✅ Reservation 1 Success!');
    } catch (e) {
        console.error('❌ Reservation 1 Failed:', e.response?.data || e.message);
    }

    console.log('\n--- TEST 2: Conflict (Already Reserved) ---');
    try {
        await axios.post(`${API_URL}/reserve`, { seatId: SEAT_ID, userId: 'user456' });
        console.error('❌ Conflict Test Failed (Should have errored)');
    } catch (e) {
        if (e.response?.status === 400 || e.response?.status === 500) {
            console.log('✅ Conflict correctly blocked (Seat Taken).');
        } else {
            console.error('❌ Unexpected Error:', e.message);
        }
    }

    console.log('\n--- TEST 3: Expiry Cycle ---');
    console.log('⏳ Simulating expiry (Setting expires_at to 5 mins ago)...');
    await conn.execute(`UPDATE seats SET expires_at = SYSDATE - INTERVAL '5' MINUTE WHERE id = :id`, [SEAT_ID]);
    await conn.commit();
    
    console.log('👀 Waiting 15s for Background Job to clean up...');
    await sleep(15000);

    const check = await conn.execute(`SELECT status FROM seats WHERE id = :id`, [SEAT_ID]);
    const status = check.rows[0][0]; // status is first column

    if (status === 0) {
        console.log('✅ Expiry Success! Seat is AVAILABLE (0) again.');
    } else {
        console.error(`❌ Expiry Failed. Seat Status is ${status} (Expected 0).`);
    }

    if (conn) await conn.close();
}

testReservation();
