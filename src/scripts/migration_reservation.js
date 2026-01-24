const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log("🔌 Connected to database...");

        try {
            await connection.execute(`ALTER TABLE seats ADD (expires_at TIMESTAMP)`);
            console.log("✅ Added 'expires_at' column.");
        } catch (e) {
            if (e.message.includes("ORA-01430")) {
                console.log("⚠️ 'expires_at' column already exists.");
            } else {
                throw e;
            }
        }

        try {
            await connection.execute(`ALTER TABLE seats ADD (hold_id VARCHAR2(100))`);
            console.log("✅ Added 'hold_id' column.");
        } catch (e) {
            if (e.message.includes("ORA-01430")) {
                console.log("⚠️ 'hold_id' column already exists.");
            } else {
                throw e;
            }
        }

    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        if (connection) {
            await connection.close();
            console.log("🔌 Connection closed.");
        }
    }
}

run();
