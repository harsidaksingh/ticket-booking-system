const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController")

const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');

router.post("/registerUser", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;