const axios = require('axios');
require('dotenv').config();

const AUTH_URL = 'http://localhost:3000/auth';
const BOOKING_URL = 'http://localhost:3000/bookings';

async function testProtectedFlow() {
    console.log("🚀 Testing Protected Booking Flow...");

    try {
        // 1. Login to get Token
        console.log("1️⃣  Logging In...");
        const loginRes = await axios.post(`${AUTH_URL}/login`, {
            email: "auth_test@test.com", // Assuming this user exists from previous test
            password: "mySecurePassword123"
        });
        
        const token = loginRes.data.token;
        console.log("🔑 Got Token!");

        // 2. Make Booking Request WITH Token
        console.log("2️⃣  Booking Ticket (With Token)...");
        const bookingRes = await axios.post(BOOKING_URL, {
            eventId: 1,
            seatId: 99
            // Note: We are NOT sending userEmail in body anymore!
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`✅ Booking Status: ${bookingRes.status} ${bookingRes.statusText}`);
        console.log(`📄 Response:`, bookingRes.data);

    } catch (error) {
        if (error.response) {
            console.error(`❌ Failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`❌ Error: ${error.message}`);
        }
    }
}

testProtectedFlow();
