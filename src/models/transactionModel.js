const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  paymentGateway: { type: String }, // e.g. Razorpay / Stripe
  transactionType: { type: String, enum: ["debit", "credit"], default: "debit" },
  transactionAmount: Number,
  transactionStatus: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  transactionReference: String, // payment gateway ID
  transactionDate: { type: Date, default: Date.now },
  meta: Object, // store payment gateway raw response
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
