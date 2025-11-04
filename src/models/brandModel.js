const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
    },
  },
  { timestamps: true, versionKey: false }
);

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
