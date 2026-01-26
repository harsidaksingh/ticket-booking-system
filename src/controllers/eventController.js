const eventService = require("../services/eventService");

const getAllEvents = async (req, res) => {
    try {
        const events = await eventService.getEvent();
        return res.status(200).json({
            result: events
        })
    } catch (error) {
        console.error(`Error in Event Controller ${error}`);
        return res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}

const getSeats = async (req, res) => {
    try {
        const { id } = req.params;
        const seats = await eventService.getSeatsForEvent(id);
        return res.status(200).json({ seats });
    } catch (error) {
        console.error(`Error in getSeats: ${error}`);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllEvents,
    getSeats
}

