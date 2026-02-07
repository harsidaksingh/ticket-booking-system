const axios = require('axios');
const oracledb = require('oracledb');
require('dotenv').config();

const API_URL = 'http://localhost:3000/auth';

// Helper to cleanup before running test
async function cleanup(email) {
    let conn;
    try {
        conn = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });
        await conn.execute(`DELETE FROM users WHERE email = :email`, { email });
        await conn.commit();
        console.log("🧹 Cleanup done.");
    } catch (e) {
        console.error("Cleanup error:", e);
    } finally {
        if (conn) await conn.close();
    }
}

async function testAuth() {
    console.log("🚀 Testing Authentication...");
    const email = "auth_test@test.com";
    const password = "mySecurePassword123";

    await cleanup(email);

    try {
        // 1. Register
        console.log("1️⃣  Registering User...");
        await axios.post(`${API_URL}/registerUser`, {
            name: "Auth Test User",
            email: email,
            password: password
        });
        console.log("✅ Registration Successful!");

        // 2. Login
        console.log("2️⃣  Logging In...");
        const response = await axios.post(`${API_URL}/login`, {
            email: email,
            password: password
        });
        
        const token = response.data.token;
        console.log("📦 Received Token:", token);

        if (token && token.length > 20) {
            console.log("🛡️  SUCCESS: Auth System Verified!");
        } else {
            console.error("❌ FAILURE: No token received.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error.response ? error.response.data : error.message);
    }
}

testAuth();
