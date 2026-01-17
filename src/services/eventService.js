const eventRepo = require("../repos/eventRepo");

const getEvent = async () => {
    const events = await eventRepo.findAll();
    return events;
}

module.exports = {
    getEvent
}