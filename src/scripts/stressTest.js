const axios = require('axios'); // You might need to npm install axios
const oracledb = require('oracledb');
require('dotenv').config();

const API_URL = 'http://localhost:3000/bookings';
const TARGET_SEAT = 5;

async function resetSeat() {
    // Reset seat to available so we can test
    let connection = await oracledb.getConnection({
        user: process.env.DB_USER || 'ticket_user',
        password: process.env.DB_PASSWORD || 'ticket_password',
        connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1'
    });
    await connection.execute(`UPDATE seats SET status = 0 WHERE seat_number = :sn`, [TARGET_SEAT]);
    await connection.execute(`DELETE FROM bookings WHERE seat_id = (SELECT id FROM seats WHERE seat_number = :sn)`, [TARGET_SEAT]);
    await connection.commit();
    await connection.close();
    console.log(`🔄 Seat ${TARGET_SEAT} Reset to Available.`);
}

async function attack() {
    await resetSeat();

    const requests = [];
    console.log('🚀 Launching 20 concurrent requests...');

    for (let i = 0; i < 20; i++) {
        const req = axios.post(API_URL, {
            eventId: 1,
            seatId: 5, // Hardcoded ID for simplicity (check your DB for actual ID if needed!)
            userEmail: `bot${i}@test.com`
        }).then(res => ({ status: res.status, data: res.data }))
            .catch(err => ({ status: err.response?.status || 500, data: err.response?.data }));

        requests.push(req);
    }

    const results = await Promise.all(requests);

    // Count successes
    const successes = results.filter(r => r.status === 201).length;
    const failures = results.filter(r => r.status === 500).length;

    console.log('--- REPORT ---');
    console.log(`✅ Successful Bookings: ${successes}`);
    console.log(`❌ Failed Bookings: ${failures}`);

    if (successes > 1) {
        console.error('🚨 CRITICAL BUG: Double Booking Detected!');
    } else {
        console.log('🛡️  System appears safe (for now).');
    }
}

attack();