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

const reserve = async (req, res) => {
    try {
        const { seatId, userId } = req.body;
        if (!seatId || !userId) {
            return res.status(400).json({ message: "Missing seatId or userId" });
        }
        await bookingService.reserveSeat(seatId, userId);
        return res.status(200).json({ message: "Reserved!" });
    } catch (error) {
        console.error("Reserve Error:", error);
        return res.status(400).json({ error: error });
    }
}

module.exports = {
    createBooking,reserve
  
}