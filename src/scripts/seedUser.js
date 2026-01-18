const oracledb = require('oracledb');
require('dotenv').config();

async function seedUsers() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER || 'ticket_user',
            password: process.env.DB_PASSWORD || 'ticket_password',
            connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1'
        });

        console.log('🔌 Connected. Creating Rich User...');

        // Create User with $100
        await connection.execute(
            `INSERT INTO users (name, email, balance) VALUES (:name, :email, :balance)`,
            { name: 'Richie Rich', email: 'rich@test.com', balance: 100 },
            { autoCommit: true }
        );

        console.log('✅ Created User: Richie Rich ($100)');

    } catch (err) {
        console.error('Seed Failed:', err);
    } finally {
        if (connection) await connection.close();
    }
}

seedUsers();