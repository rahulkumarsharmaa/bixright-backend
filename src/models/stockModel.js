const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
    },

    reason: {
      type: String,
      enum: ["purchase", "order", "stockAdjustment"],
      default: "Order",
    },

    status: {
      type: String,
      enum: ["in", "out"],
      default: "out",
    },

    note: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    
  },
  { timestamps: true, versionKey: false }
);

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
