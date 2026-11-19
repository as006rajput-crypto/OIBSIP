
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");

const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

console.log("ADMIN ROUTES LOADED SUCCESSFULLY");

// Admin Route Test
app.get("/api/admin/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin route is working!"
  });
});

// Home Route
app.get("/", (req, res) => {
  res.send("PizzaHub Backend is Running!");
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "PizzaHub Backend is Healthy",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// MongoDB Connection
console.log("Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
