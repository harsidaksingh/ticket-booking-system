const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const { initializeDB } = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const logger = require("./config/logger");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const { releaseExpireSeats } = require("./repos/bookingRepo");
const { connectRedis, getSubClient } = require("./config/redis");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200", // Must be exact when using credentials
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // Must be exact when using credentials
    credentials: true,
  },
});

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);

app.use(errorHandler); // Must be the last middleware

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

async function start() {
  await initializeDB();
  server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
  await connectRedis();
  const subClient = getSubClient();
  await subClient.subscribe("seat-updates", (message) => {
    try {
      const data = JSON.parse(message);
      io.to(`event:${data.eventId}`).emit("seatUpdate", data);
    } catch (error) {
      logger.error("Error parsing seat update message", error);
    }
  });
  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("joinEvent", (eventId) => {
      socket.join(`event:${eventId}`);
      logger.info(`Socket ${socket.id} joined event:${eventId}`);
    });

    socket.on("leaveEvent", (eventId) => {
      socket.leave(`event:${eventId}`);
      logger.info(`Socket ${socket.id} left event:${eventId}`);
    });
  });
}

start().then(() => {
  setInterval(releaseExpireSeats, 10 * 1000);
});
