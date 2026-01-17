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

module.exports = {
    getAllEvents
}

