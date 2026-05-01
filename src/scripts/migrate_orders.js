const oracledb = require('oracledb');
require('dotenv').config();

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        // Step 1: Drop old bookings table
        console.log("Dropping old bookings table...");
        try {
            await connection.execute(`DROP TABLE bookings`);
            console.log("✅ bookings table dropped.");
        } catch (err) {
            if (err.errorNum === 942) {
                console.log("ℹ️  bookings table doesn't exist, skipping drop.");
            } else {
                throw err;
            }
        }

        // Step 2: Create orders table
        console.log("Creating orders table...");
        try {
            await connection.execute(`
                CREATE TABLE orders (
                    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    event_id NUMBER NOT NULL,
                    user_email VARCHAR2(100),
                    status VARCHAR2(50),
                    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("✅ orders table created.");
        } catch (err) {
            if (err.errorNum === 955) {
                console.log("ℹ️  orders table already exists, skipping.");
            } else {
                throw err;
            }
        }

        // Step 3: Create order_items table
        console.log("Creating order_items table...");
        try {
            await connection.execute(`
                CREATE TABLE order_items (
                    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    order_id NUMBER NOT NULL,
                    seat_id NUMBER NOT NULL,
                    CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders(id),
                    CONSTRAINT fk_booking_seat2 FOREIGN KEY (seat_id) REFERENCES seats(id)
                )
            `);
            console.log("✅ order_items table created.");
        } catch (err) {
            if (err.errorNum === 955) {
                console.log("ℹ️  order_items table already exists, skipping.");
            } else {
                throw err;
            }
        }

        console.log("\n🎉 Migration complete! orders + order_items are ready.");

    } catch (err) {
        console.error("❌ Migration failed:", err);
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
