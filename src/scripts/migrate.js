// src/scripts/migrate.js
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'ticket_user',
    password: process.env.DB_PASSWORD || 'ticket_password',
    connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1'
};

async function runMigration() {
    let connection;
    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Connect to Oracle
        connection = await oracledb.getConnection(dbConfig);
        console.log('🔌 Connected to Oracle. Running migrations...');

        // Split by semicolon to handle multiple statements
        const statements = sql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                await connection.execute(statement);
                console.log('✅ Executed SQL Statement');
            } catch (err) {
                if (err.message.includes('ORA-00955')) {
                    console.log('⚠️  Table already exists, skipping.');
                } else {
                    console.error('❌ Error executing:', statement);
                    console.error(err.message);
                }
            }
        }
    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('🔌 Disconnected.');
        }
    }
}

runMigration();