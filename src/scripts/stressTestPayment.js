// src/scripts/stressTestPayment.js
const axios = require('axios');
const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'ticket_user',
    password: process.env.DB_PASSWORD || 'ticket_password',
    connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1'
};

async function attack() {
    // 1. Reset Balance to 50
    const conn = await oracledb.getConnection(dbConfig);
    await conn.execute("UPDATE users SET balance = 50 WHERE email = 'rich@test.com'");
    await conn.execute("UPDATE seats SET status = 0 WHERE seat_number IN (80, 81)"); // Free spots
    await conn.commit();
    await conn.close();
    console.log("🔄 Reset: Balance $50, Seats 80/81 Open");

    console.log("🚀 Attacking...");
    const req1 = axios.post('http://localhost:3000/bookings/payment', { eventId: 1, seatId: 80, userEmail: 'rich@test.com' });
    const req2 = axios.post('http://localhost:3000/bookings/payment', { eventId: 1, seatId: 81, userEmail: 'rich@test.com' });

    try {
        await Promise.all([req1, req2]);
        console.log("🚨 DOUBLE SPEND! Both requests succeeded!");
    } catch (err) {
        console.log("✅ Blocked! One failed.");
    }
}

attack();