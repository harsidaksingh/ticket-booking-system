const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    balance: Joi.number().min(0).optional() // Allow initial balance for testing
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const bookingSchema = Joi.object({
    eventId: Joi.number().integer().min(1).required(),
    seatId: Joi.number().integer().min(1).required()
});

const reserveSchema = Joi.object({
    eventId: Joi.number().integer().min(1).required(),
    seatId: Joi.number().integer().min(1).required(),
    userId: Joi.string().email().required()
});

module.exports = {
    registerSchema,
    loginSchema,
    bookingSchema,
    reserveSchema
};
