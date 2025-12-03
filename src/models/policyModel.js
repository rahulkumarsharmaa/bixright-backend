const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    deliveryWithinDays: {
      type: Number,
      default: 7,
    },
    shippingContent: {
      type: String,
      required: true,
    },
    minFreeShippingAmount: {
      type: Number,
      default: 0,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    shippingNote: {
      type: String,
      default: "Free shipping",
    },
    returnContent: {
      type: String,
      required: true,
    },
    returnPeriodDays: {
      type: Number,
      default: 7,
    },
    returnConditions: {
      type: String,
      default: "Item must be unused, with tags and original packaging.",
    },
    isActive: {
      type: Boolean,
      default: true,
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
module.exports = mongoose.model("Policy", policySchema);
