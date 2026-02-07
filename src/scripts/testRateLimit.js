const axios = require('axios');
const API_URL = 'http://localhost:3000/bookings';

async function testRateLimit() {
    console.log("🚀 Testing Rate Limiter (Limit: 10/min)...");
    
    // We need to use valid data so the request passes validation and hits the limiter
    const payload = {
        eventId: 1,
        seatId: 50,
        userEmail: "rate_limit_test@test.com"
    };

    let successCount = 0;
    let blockedCount = 0;

    for (let i = 1; i <= 15; i++) {
        try {
            // Add a tiny delay to avoid overwhelming the network stack locally
            await new Promise(r => setTimeout(r, 100));
            
            console.log(`Request #${i}...`);
            const response = await axios.post(API_URL, payload);
            
            if (response.status === 202) {
                console.log(`✅ #${i}: Accepted`);
                successCount++;
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log(`🛑 #${i}: BLOCKED (429 Too Many Requests)`);
                blockedCount++;
            } else {
                console.log(`❌ #${i}: Error ${error.message} (${error.response ? error.response.status : 'No Status'})`);
            }
        }
    }

    console.log("\n--- REPORT ---");
    console.log(`Accepted: ${successCount}`);
    console.log(`Blocked: ${blockedCount}`);

    if (blockedCount > 0 && successCount <= 11) {
        console.log("🛡️  SUCCESS: Rate Limiter is working!");
    } else {
        console.log("⚠️  FAILURE: Rate Limiter did not trigger correctly.");
    }
}

testRateLimit();
