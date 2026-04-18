const eventRepo = require("../repos/eventRepo");

const getEvent = async () => {
    const events = await eventRepo.findAll();
    return events.map(row => ({
        id:row.ID,
        name:row.NAME,
        totalSeats:row.TOTAL_SEATS
    }));
}

const getSeatsForEvent = async (eventId) => {
    const seats = await eventRepo.getEventSeats(eventId);
    return seats.map(row => ({
        id:row.ID,
        eventId:row.EVENT_ID,
        status:row.STATUS
    }));
}
module.exports = {
    getEvent,getSeatsForEvent
}