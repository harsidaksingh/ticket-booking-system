const express = require('express');
const router = express.Router();
const eventController = require("../controllers/eventController")

router.get('/', eventController.getAllEvents);
router.get('/:id/seats', eventController.getSeats);

module.exports = router;