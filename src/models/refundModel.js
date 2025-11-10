const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  reason: { type: String },
  refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  date: { type: Date, default: Date.now },
});

const Refund = mongoose.model("Refund", refundSchema);

module.exports = Refund
