const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const authToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token) {
      logger.error("Access Denied: No Token Provided");
      return res.status(401).json({
        message: "Access Denied: No Token Provided",
      });
    }
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "do_not_use_in_prod",
    );
    req.user = verified;
    next();
  } catch (error) {
    logger.error("Invalid Token");
    return res.status(403).json({
      message: "Invalid Token",
    });
  }
};

module.exports = authToken;
