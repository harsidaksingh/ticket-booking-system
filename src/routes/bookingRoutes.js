const express = require('express');
const router = express.Router();
const bookingController = require("../controllers/bookingController")
const rateLimiter = require("../middleware/rateLimiter")

router.post('/', rateLimiter,bookingController.createBooking);
router.post('/reserve',bookingController.reserve);
router.get('/status/:reqId',bookingController.getBookingStatus)

module.exports = router;