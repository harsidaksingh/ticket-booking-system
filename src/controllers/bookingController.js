const bookingService = require("../services/bookingService")
const mqService = require("../config/rabbitmq");

const createBooking = async (req, res) => {
    try {
        const { eventId, seatId, userEmail } = req.body;

        if (!eventId || !seatId || !userEmail) {
            return res.status(400).json({
                message: "Invalid Request"
            })
        }

        // await bookingService.createBooking(eventId, seatId, userEmail);
        await mqService.publishToQueue({eventId,seatId,userEmail});
        return res.status(202).json({ 
            message: 'Request Accepted. Processing...',
            status: 'PENDING' 
        });

    } catch (error) {
        console.error(`Error in Booking controller ${error}`);
        return res.status(500).json({
            error: error.message
        })
    }
}

const reserve = async (req, res) => {
    try {
        const { eventId,seatId, userId } = req.body;
        if (!eventId || !seatId || !userId) {
            return res.status(400).json({ message: "Invalid Request" });
        }
        await bookingService.reserveSeat(eventId,seatId, userId);
        return res.status(200).json({ message: "Reserved!" });
    } catch (error) {
        console.error("Reserve Error:", error);
        return res.status(400).json({ error: error });
    }
}

module.exports = {
    createBooking,reserve
  
}