const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:3000';

async function testValidation() {
    console.log("🚀 Testing Input Validation (Expect 400 Bad Request)...");

    const tests = [
        {
            name: "Register - Short Password",
            method: "POST",
            url: `${API_BASE}/auth/registerUser`,
            data: { name: "User", email: "valid@test.com", password: "123" }, // Password < 6
            expectedStatus: 400
        },
        {
            name: "Register - Invalid Email",
            method: "POST",
            url: `${API_BASE}/auth/registerUser`,
            data: { name: "User", email: "not-an-email", password: "password123" },
            expectedStatus: 400
        },
        {
            name: "Login - Missing Password",
            method: "POST",
            url: `${API_BASE}/auth/login`,
            data: { email: "valid@test.com" }, // Missing password
            expectedStatus: 400
        },
        {
            name: "Reserve - String ID",
            method: "POST",
            url: `${API_BASE}/bookings/reserve`,
            data: { eventId: "one", seatId: 50, userId: "valid@test.com" }, // eventId string
            expectedStatus: 400
        },
        {
            name: "Book - Negative ID",
            method: "POST",
            url: `${API_BASE}/bookings`,
            data: { eventId: 1, seatId: -5 }, // seatId negative
            auth: true,
            expectedStatus: 400
        }
    ];

    // Login for token (for the auth required test)
    let token = "";
    try {
        // Register a valid user first (just in case)
        try {
            await axios.post(`${API_BASE}/auth/registerUser`, { name: "Val User", email: "val_user@test.com", password: "password123" });
        } catch (e) {} 
        const login = await axios.post(`${API_BASE}/auth/login`, { email: "val_user@test.com", password: "password123" });
        token = login.data.token;
    } catch (e) {
        console.error("❌ Setup Failed: Could not login for auth tests.");
        console.error(e.response ? e.response.data : e.message);
        // Continue anyway to test non-auth routes
    }

    let passed = 0;
    for (const test of tests) {
        try {
            const config = {};
            if (test.auth) config.headers = { 'Authorization': `Bearer ${token}` };

            await axios({
                method: test.method,
                url: test.url,
                data: test.data,
                ...config
            });
            console.error(`❌ ${test.name}: FAILED (Expected ${test.expectedStatus}, got 200/202)`);
        } catch (error) {
            if (error.response && error.response.status === test.expectedStatus) {
                console.log(`✅ ${test.name}: PASSED (Got ${test.expectedStatus}: ${error.response.data.error})`);
                passed++;
            } else {
                console.error(`❌ ${test.name}: FAILED (Expected ${test.expectedStatus}, got ${error.response?.status})`);
                console.error(error.response?.data);
            }
        }
    }

    console.log(`\n📊 Result: ${passed}/${tests.length} tests passed.`);
}

testValidation();
