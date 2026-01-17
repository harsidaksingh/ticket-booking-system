const bookingService = require("../services/bookingService")

const createBooking = async (req, res) => {
    try {
        const eventId = req.body.eventId;
        const seatId = req.body.seatId;
        const userEmail = req.body.userEmail;

        if (!eventId || !seatId || !userEmail) {
            return res.status(400).json({
                message: "Invalid Request"
            })
        }

        await bookingService.bookSeat(eventId, seatId, userEmail);
        return res.status(201).json({ message: 'Booked!' });

    } catch (error) {
        console.error(`Error in Booking controller ${error}`);
        return res.status(500).json({
            error: error
        })
    }
}

module.exports = {
    createBooking
}