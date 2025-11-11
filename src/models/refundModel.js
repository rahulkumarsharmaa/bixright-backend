const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    refundedItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number },
        amount: { type: Number, required: true },
      },
    ],

    totalRefund: { type: Number, required: true },
    reason: { type: String },
    refundStatus: {
      type: String,
      enum: ["requested", "approved", "rejected", "processed"],
      default: "requested",
    },
    paymentMethod: { type: String }, // cash, card, etc.
    transactionId: { type: String },
    remark: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Refund = mongoose.model("Refund", refundSchema);

module.exports = Refund;
