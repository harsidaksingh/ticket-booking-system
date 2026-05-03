require('dotenv').config({ path: 'c:/Users/User/ticket-app/.env' });
const oracledb = require('oracledb');

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER || 'ticket_user',
            password: process.env.DB_PASSWORD || 'ticket_password',
            connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREEPDB1'
        });

        await connection.execute(`
            create table outbox_events(
                id number generated always as identity primary key,
                payload varchar2(4000) not null,
                status varchar2(20) default 'PENDING',
                created_at timestamp default current_timestamp
            )
        `);
        console.log('✅ outbox_events table created successfully');
    } catch (err) {
        if (err.message.includes('ORA-00955')) {
            console.log('Table already exists!');
        } else {
            console.error('❌ Error:', err.message);
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

run();
