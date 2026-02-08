const bookingService = require("../services/bookingService")
const mqService = require("../config/rabbitmq");
const { getClient } = require('../config/redis');
const crypto = require("crypto")

const createBooking = async (req, res) => {
    try {
        const { eventId, seatId } = req.body;
        const userEmail = req.user.email;
        if (!eventId || !seatId || !userEmail) {
            return res.status(400).json({
                message: "Invalid Request"
            })
        }
        const client = getClient();
        const reqId = crypto.randomUUID();

        await client.set("booking:"+reqId,"PENDING");
        await mqService.publishToQueue({eventId,seatId,userEmail,reqId});
        return res.status(202).json({ 
            message: 'Request Accepted. Processing...',
            status: 'PENDING' ,
            reqId: reqId
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

const getBookingStatus = async (req, res) => {
    try {
        const { reqId } = req.params;
        if (!reqId) return res.status(400).json({ message: "Missing Request ID" });
        const client = getClient();
        const status = await client.get(`booking:${reqId}`);
        if (!status) return res.status(404).json({ message: "Booking Request Not Found" });
        return res.status(200).json({ reqId, status });
    } catch (error) {
        console.error("Status Check Error:", error);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createBooking,reserve,getBookingStatus
  
}