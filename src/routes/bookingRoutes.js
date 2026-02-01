const express = require('express');
const router = express.Router();
const bookingController = require("../controllers/bookingController")

router.post('/', bookingController.createBooking);
router.post('/reserve',bookingController.reserve);
router.get('/status/:reqId',bookingController.getBookingStatus)

module.exports = router;