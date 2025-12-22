const mongoose = require("mongoose");

const salesReturnSchema = new mongoose.Schema(
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
    returnedItems: [
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

    totalReturn: { type: Number, required: true },
    reason: { type: String },

    returnStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "processed"],
      default: "pending",
    },

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

const SalesReturn = mongoose.model("SalesReturn", salesReturnSchema);

module.exports = SalesReturn;
