const eventService = require("../services/eventService");

const getAllEvents = async (req, res) => {
    const events = await eventService.getEvent();
    return res.status(200).json({
        result: events
    })
}

const getSeats = async (req, res) => {
    const { id } = req.params;
    const seats = await eventService.getSeatsForEvent(id);
    return res.status(200).json({ seats });
}

module.exports = {
    getAllEvents,
    getSeats
}

