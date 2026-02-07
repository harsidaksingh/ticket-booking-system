const oracledb = require('oracledb');
require('dotenv').config();

async function run() {
    let connection;
    try {
        console.log("Adding password column...");
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        const sql = `ALTER TABLE users ADD (password VARCHAR2(255))`;
        await connection.execute(sql);
        console.log("✅ Users table updated!");

    } catch (err) {
        if (err.errorNum === 1430) {
            console.log("ℹ️  Column 'password' already exists.");
        } else {
            console.error(err);
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

run();
