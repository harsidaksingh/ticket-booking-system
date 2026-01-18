const bookingService = require("../services/bookingService")

const createBooking = async (req, res) => {
    try {
        const { eventId, seatId, userEmail } = req.body;

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
            error: error.message
        })
    }
}

const createBookingWithPayment = async (req, res) => {
    try {
        const { eventId, seatId, userEmail } = req.body; // Destructuring is cleaner!
        if (!eventId || !seatId || !userEmail) {
            return res.status(400).json({ message: "Invalid Request" });
        }
        await bookingService.bookWithPayment(eventId, seatId, userEmail);
        return res.status(201).json({ message: 'Payment Successful & Booked!' });
    } catch (error) {
        console.error(`Error in Payment: ${error}`);
        // Return 400 for business logic errors (Funds), 500 for crashes
        const status = error.message === "Insufficient Funds" ? 400 : 500;
        return res.status(status).json({ error: error.message });
    }
}
module.exports = {
    createBooking,
    createBookingWithPayment // Export it!
}