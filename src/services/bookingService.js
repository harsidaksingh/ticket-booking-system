const bookingrepo = require("../repos/bookingRepo")

const bookSeat = async (eventId, seatId, userEmail) => {
    await bookingrepo.createBooking(eventId, seatId, userEmail);
}

module.exports = {
    bookSeat
}