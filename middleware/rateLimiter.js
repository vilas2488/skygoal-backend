const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP
  message: "Too many requests, try again later.",
});
