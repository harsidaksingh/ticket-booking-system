const eventRepo = require("../repos/eventRepo");

const getEvent = async () => {
    const events = await eventRepo.findAll();
    return events;
}

const getSeatsForEvent = async (eventId) => {
    const seats = await eventRepo.getEventSeats(eventId);
    return seats;
}
module.exports = {
    getEvent,getSeatsForEvent
}