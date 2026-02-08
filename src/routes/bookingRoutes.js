const express = require('express');
const router = express.Router();
const bookingController = require("../controllers/bookingController")
const rateLimiter = require("../middleware/rateLimiter")
const authToken = require("../middleware/authToken")

router.post('/',authToken, rateLimiter,bookingController.createBooking);
router.post('/reserve',bookingController.reserve);
router.get('/status/:reqId',bookingController.getBookingStatus)

module.exports = router;