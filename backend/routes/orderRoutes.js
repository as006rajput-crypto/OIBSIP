
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Place a new order
router.post("/", async (req, res) => {
  try {
    const { customer, items, totalAmount, paymentMethod } = req.body;

    if (!customer || !items || items.length === 0 || totalAmount == null) {
      return res.status(400).json({
        success: false,
        message: "Please provide all order details.",
      });
    }

    const newOrder = new Order({
      customer,
      items,
      totalAmount,
      paymentMethod,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to place order.",
      error: error.message,
    });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
});

// Update order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Status Update Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
});

module.exports = router;
