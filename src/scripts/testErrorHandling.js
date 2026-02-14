const axios = require('axios');
const { getSeat, reserveSeat } = require('../repos/bookingRepo'); // Direct DB access for setup if needed
require('dotenv').config();

const API_BASE = 'http://localhost:3000';
const SEAT_ID = 52; // Use a specific seat for conflict test

async function testErrorHandling() {
    console.log("🚀 Testing Global Error Handling & AppError...");

    // 1. Test 401 Unauthorized (Wrong Password)
    try {
        await axios.post(`${API_BASE}/auth/login`, {
            email: "valid@test.com",
            password: "WRONG_PASSWORD"
        });
        console.error("❌ 401 Test Failed: Login succeeded unexpectedly.");
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("✅ 401 Verified: Invalid Password returns 401.");
        } else {
            console.error(`❌ 401 Test Failed: Got ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
        }
    }

    // 2. Test 409 Conflict (Seat Already Taken)
    // Setup: Reserve the seat first
    let token;
    try {
        // Register/Login a user
        try { await axios.post(`${API_BASE}/auth/registerUser`, { name: "ErrUser", email: "err@test.com", password: "password123" }); } catch (e) {}
        const login = await axios.post(`${API_BASE}/auth/login`, { email: "err@test.com", password: "password123" });
        token = login.data.token;

        // Reserve it once
        try {
            await axios.post(`${API_BASE}/bookings/reserve`, { eventId: 1, seatId: SEAT_ID, userId: "err@test.com" });
        } catch (e) {
            // If already reserved, that's fine for the next step, but let's log
            // console.log("Setup: Seat maybe already reserved.");
        }

        // Try to reserve AGAIN (Should fail)
        await axios.post(`${API_BASE}/bookings/reserve`, {
            eventId: 1,
            seatId: SEAT_ID,
            userId: "err@test.com"
        });
        console.error("❌ 409 Test Failed: Double reservation succeeded.");

    } catch (error) {
        if (error.response && error.response.status === 409) {
            console.log("✅ 409 Verified: Double Reservation returns 409 Conflict.");
        } else if (error.response && error.response.status === 400 && error.response.data.error === "Seat Already Taken") {
             // If my code returns 400 for some reason?
             console.error(`❌ 409 Test Failed: Got 400. Did we forget to set statusCode in AppError?`);
        } else {
            console.error(`❌ 409 Test Failed: Got ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
        }
    }

    // 3. Test 404 Not Found (User Lookup)
    // We can't easily trigger this on valid login unless we hack the DB, but "User not found" in booking calls throws 404.
    // Let's force a Booking call with a user that doesn't exist in DB but we pass check? 
    // Actually, createBooking reads user from DB based on token. 
    // Hard to mock "User not found" if token is valid (User must exist to get token).
    // Skip for now.
}

testErrorHandling();
