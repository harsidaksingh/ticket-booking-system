// src/config/db.js
const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'ticket_user',
    password: process.env.DB_PASSWORD || 'ticket_password',
    connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1',
    poolMin: 2,
    poolMax: 25,
    poolIncrement: 1,
    poolAlias: 'oracleDB'
};

async function initializeDB() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('✅ Oracle DB Connection Pool Started');

        // Test connection
        const connection = await oracledb.getConnection('oracleDB');
        await connection.execute(`SELECT 'Oracle Test Success' FROM DUAL`);
        console.log('✅ Connected to Oracle Database!');
        await connection.close();
    } catch (err) {
        console.error('❌ DB Init Error:', err);
        process.exit(1);
    }
}

async function closeDB() {
    try {
        await oracledb.getPool('oracleDB').close(10);
        console.log('Oracle DB Pool Closed');
    } catch (err) {
        console.error('DB Close Error:', err);
    }
}

module.exports = { initializeDB, closeDB };