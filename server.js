require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const rateLimiter = require("./middleware/rateLimiter");
require("./cron/resetLoginAttempts");

const app = express();
connectDB();

app.use(express.json());
app.use(rateLimiter); // Apply rate limit globally
app.use(
  cors({
    origin: '*'
  })
);

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
