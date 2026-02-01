const axios = require('axios');
const oracledb = require('oracledb');
require('dotenv').config();

const API_URL = 'http://localhost:3000/bookings';
const SEAT_ID = 50;

async function testPolling() {
    console.log("🚀 Testing Async Polling Flow...");
    
    // 0. Seed Data (Ensure User Exists)
    let conn;
    try {
        console.log("0️⃣  Seeding Data...");
        conn = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        // Reset Seat 50 to Available
        await conn.execute(`UPDATE seats SET status = 0, version = 0 WHERE id = :id`, { id: SEAT_ID });
        
        // Seed the user
        const email = "polling_user@test.com";
        await conn.execute(
            `MERGE INTO users u USING dual ON (u.email = :email)
             WHEN MATCHED THEN UPDATE SET balance = 1000
             WHEN NOT MATCHED THEN INSERT (name, email, balance) VALUES (:name, :email, 1000)`,
            { name: "Polling User", email: email }
        );
        // Clear old bookings for this seat
        await conn.execute(`DELETE FROM bookings WHERE seat_id = :id`, { id: SEAT_ID });
        
        await conn.commit();
        console.log("✅ Seat 50 reset and User seeded.");

    } catch (err) {
        console.error("❌ Setup failed:", err);
        if (conn) await conn.close();
        return;
    } finally {
        if (conn) await conn.close();
    }

    try {
        // 1. Send Request
        console.log("1️⃣  Sending Booking Request...");
        const response = await axios.post(API_URL, {
            eventId: 1,
            seatId: SEAT_ID,
            userEmail: "polling_user@test.com"
        });

        const { status, message, reqId } = response.data;
        console.log(`📥 API Response: ${response.status} ${response.statusText}`);
        console.log(`🆔 Request ID: ${reqId}`);

        if (!reqId) {
            console.error("❌ ERROR: The API did not return a 'reqId'!");
            return;
        }

        // 2. Poll Status
        console.log("2️⃣  Polling Status endpoint...");
        const pollUrl = `${API_URL}/status/${reqId}`;
        
        let attempts = 0;
        const maxAttempts = 10;
        
        const interval = setInterval(async () => {
            attempts++;
            try {
                const pollRes = await axios.get(pollUrl);
                const currentStatus = pollRes.data.status;
                console.log(`   Attempt ${attempts}: Status = ${currentStatus}`);

                if (currentStatus === 'CONFIRMED' || currentStatus === 'FAILED') {
                    clearInterval(interval);
                    console.log(`\n🎉 Final Result: ${currentStatus}`);
                    if (currentStatus === 'CONFIRMED') {
                        console.log("✅ Async Flow Verified!");
                    } else {
                        console.log("⚠️  Booking Failed (Check Worker logs).");
                    }
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    console.log("\n⏰ Timed out waiting for status change.");
                }
            } catch (err) {
                console.log(`   Attempt ${attempts}: Poll failed (${err.message})`);
            }
        }, 1000);

    } catch (error) {
        if (error.response) {
            console.error(`❌ Request Failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`❌ Network Error: ${error.message} (Is the server running?)`);
        }
    }
}

testPolling();
