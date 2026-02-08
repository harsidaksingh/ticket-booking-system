const axios = require('axios');
const oracledb = require('oracledb');
const bookingRepo = require('../repos/bookingRepo'); // Direct import to call cleanup
const { initializeDB } = require('../config/db');
require('dotenv').config();

const API_BASE = 'http://localhost:3000';
const SEAT_ID = 60; // Using a fresh seat for this test

// Helper: Backdate seat expiration to simulate time travel ⏰
async function simulateTimeTravel() {
    const conn = await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING
    });
    // Set expires_at to 1 hour ago
    await conn.execute(
        `UPDATE seats SET expires_at = SYSDATE - interval '1' hour WHERE id = :id`, 
        { id: SEAT_ID }
    );
    await conn.commit();
    await conn.close();
    console.log("⏰ Simulated 4+ minutes passing (Seat Expired).");
}

// Helper: Poll Status
async function pollStatus(reqId) {
    for (let i = 0; i < 15; i++) { // Try 15 times (15 seconds)
        const res = await axios.get(`${API_BASE}/bookings/status/${reqId}`);
        const status = res.data.status;
        console.log(` ... Polling Status: ${status}`);
        if (status === 'CONFIRMED' || status === 'FAILED') return status;
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s
    }
    return 'TIMEOUT';
}

async function testExpiryRace() {
    console.log("🚀 Testing Expiry -> Stolen -> Failure Logic (ASYNC)...");
    await initializeDB();
    let tokenA, tokenB;

    try {
        // 1. Setup: Reset Seat
        const conn = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });
        await conn.execute(`UPDATE seats SET status = 0, hold_id = NULL, version = 0 WHERE id = :id`, { id: SEAT_ID });
        await conn.execute(`DELETE FROM bookings WHERE seat_id = :id`, { id: SEAT_ID });
        await conn.commit();
        await conn.close();
        console.log("🧹 Seat and Bookings Reset.");

        // 2. Login User A & User B
        const loginA = await axios.post(`${API_BASE}/auth/login`, { email: "auth_test@test.com", password: "mySecurePassword123" });
        tokenA = loginA.data.token;
        const loginB = await axios.post(`${API_BASE}/auth/login`, { email: "user_b@test.com", password: "password123" });
        tokenB = loginB.data.token;
        console.log("🔑 Logged in Users.");

        // 3. User A Reserves Seat (Attempt 1)
        console.log("🎟️ User A reserves seat...");
        await axios.post(`${API_BASE}/bookings/reserve`, { eventId: 1, seatId: SEAT_ID, userId: "auth_test@test.com" });
        console.log("✅ User A Reserved.");

        // 4. Time Passes & Cleanup Runs
        await simulateTimeTravel();
        await bookingRepo.releaseExpireSeats(); // Manually trigger the cleaner job

        // 5. User B Steals the Seat!
        console.log("😈 User B finds free seat and reserves it...");
        await axios.post(`${API_BASE}/bookings/reserve`, { eventId: 1, seatId: SEAT_ID, userId: "user_b@test.com" });
        console.log("✅ User B Reserved (Stolen!).");

        // 6. User A (Oblivious) Tries to Pay
        console.log("😨 User A (Slow) tries to confirm booking...");
        try {
            const bookRes = await axios.post(`${API_BASE}/bookings`, { eventId: 1, seatId: SEAT_ID }, {
                headers: { 'Authorization': `Bearer ${tokenA}` }
            });
            console.log(`✅ Accepted (202). ReqId: ${bookRes.data.reqId}`);
            
            // 7. Poll for Outcome
            const status = await pollStatus(bookRes.data.reqId);
            
            if (status === 'FAILED') {
                console.log("✅ SUCCESS: User A was BLOCKED by the Worker (Status: FAILED).");
            } else {
                console.error(`❌ FAILURE: User A's final status was ${status} (expected FAILED).`);
            }

        } catch (error) {
            console.log(`✅ SUCCESS: User A was blocked immediately (Status: ${error.response?.status})`);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
}

testExpiryRace();
