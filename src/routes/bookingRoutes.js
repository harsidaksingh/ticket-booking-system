const express = require('express');
const router = express.Router();
const bookingController = require("../controllers/bookingController")
const rateLimiter = require("../middleware/rateLimiter")
const authToken = require("../middleware/authToken")

const validate = require('../middleware/validate');
const { bookingSchema, reserveSchema } = require('../utils/validationSchemas');

router.post('/', authToken, rateLimiter, validate(bookingSchema), bookingController.createBooking);
router.post('/reserve', validate(reserveSchema), bookingController.reserve);
router.get('/status/:reqId',bookingController.getBookingStatus)

module.exports = router;