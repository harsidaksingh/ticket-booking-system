const bookingService = require("../services/bookingService")

const createBooking = async (req, res) => {
    try {
        const { eventId, seatId, userEmail } = req.body;

        if (!eventId || !seatId || !userEmail) {
            return res.status(400).json({
                message: "Invalid Request"
            })
        }

        await bookingService.createBooking(eventId, seatId, userEmail);
        return res.status(201).json({ message: 'Booked!' });

    } catch (error) {
        console.error(`Error in Booking controller ${error}`);
        return res.status(500).json({
            error: error.message
        })
    }
}


module.exports = {
    createBooking,
  
}