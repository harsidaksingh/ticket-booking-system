const express = require('express');
const app = express();
const { initializeDB } = require('./config/db');
const eventRoutes = require("./routes/eventRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const authRoutes = require("./routes/authRoutes")
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const {releaseExpireSeats} = require("./repos/bookingRepo")
const { connectRedis } = require('./config/redis');

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/auth',authRoutes)
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes)

app.use(errorHandler); // Must be the last middleware

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

async function start() {
    await initializeDB();
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
    })
    await connectRedis();
}

start().then(() => {
    setInterval(releaseExpireSeats,10*1000);
})