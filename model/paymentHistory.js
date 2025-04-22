const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  agentName: { type: String,  },
  orderId: { type: String, },
  paymentId: { type: String, },
  amount: { type: Number, },
  reason: { type: String, },
  status: { type: String, enum: ["Success", "Failed","Debit"], },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);
