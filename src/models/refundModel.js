const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    order: {
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
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
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
      enum: ["pending", "approved", "rejected", "processed"],
      default: "pending",
    },

    paymentMethod: { type: String }, // cash, card, etc.
    transactionId: { type: String },
    remark: { type: String },
    date: { type: Date, default: Date.now },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Refund = mongoose.model("Refund", refundSchema);

module.exports = Refund;
