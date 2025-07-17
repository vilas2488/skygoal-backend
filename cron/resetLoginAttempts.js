const cron = require("node-cron");
const User = require("../models/User");

cron.schedule("0 */3 * * *", async () => {
  await User.updateMany({}, { $set: { loginAttempts: 0, lockUntil: null } });
  console.log("Reset login attempts every 3 hours");
});
