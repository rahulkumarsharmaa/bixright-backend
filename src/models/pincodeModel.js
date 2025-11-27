// models/Pincode.js
const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Pincode", pincodeSchema);
