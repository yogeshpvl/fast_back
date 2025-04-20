const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Success", "Failed"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);
