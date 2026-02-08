const axios = require('axios');
const oracledb = require('oracledb');
require('dotenv').config();

const API_BASE = 'http://localhost:3000';
const SEAT_ID = 55; // Using a fresh seat for this test

async function testReserveFlow() {
    console.log("🚀 Testing Reservation -> Booking Logic...");

    let tokenA, tokenB;

    try {
        // 1. Setup: Reset Seat
        const conn = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });
        await conn.execute(`UPDATE seats SET status = 0, hold_id = NULL WHERE id = :id`, { id: SEAT_ID });
        await conn.commit();
        await conn.close();
        console.log("🧹 Seat Reset.");

        // 2. Login User A & User B
        const loginA = await axios.post(`${API_BASE}/auth/login`, { email: "auth_test@test.com", password: "mySecurePassword123" });
        tokenA = loginA.data.token;
        
        // Quick register user B if not exists (or just login)
        try {
            await axios.post(`${API_BASE}/auth/registerUser`, { name: "User B", email: "user_b@test.com", password: "password123" });
        } catch (e) {} // Ignore if exists
        const loginB = await axios.post(`${API_BASE}/auth/login`, { email: "user_b@test.com", password: "password123" });
        tokenB = loginB.data.token;

        console.log("🔑 Logged in User A and User B.");

        // 3. User A Reserves Seat
        console.log("🎟️ User A reserving seat...");
        await axios.post(`${API_BASE}/bookings/reserve`, {
            eventId: 1,
            seatId: SEAT_ID,
            userId: "auth_test@test.com" // Still passing userId in body for reserve endpoint, consistent with current controller
        });
        console.log("✅ Reservation successful (Status should be 1).");

        // 4. User B Tries to Book (Should Fail)
        console.log("😈 User B trying to steal seat...");
        try {
            await axios.post(`${API_BASE}/bookings`, { eventId: 1, seatId: SEAT_ID }, {
                headers: { 'Authorization': `Bearer ${tokenB}` }
            });
            console.error("❌ FAILURE: User B should NOT be able to book User A's updated seat!");
        } catch (error) {
            console.log("✅ SUCCESS: User B was blocked (400/500).");
        }

        // 5. User A Tries to Book (Should Succeed)
        console.log("😇 User A trying to confirm booking...");
        const bookRes = await axios.post(`${API_BASE}/bookings`, { eventId: 1, seatId: SEAT_ID }, {
            headers: { 'Authorization': `Bearer ${tokenA}` }
        });

        console.log(`✅ Booking Response: ${bookRes.status}`);
        console.log("🎉 Test Passed: Logic allows booking RESERVED seats if YOU own them.");

    } catch (error) {
        console.error("❌ Test Failed:", error.response ? error.response.data : error.message);
    }
}

testReserveFlow();
