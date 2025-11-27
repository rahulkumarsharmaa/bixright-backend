const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: (v) => v.replace(/\s+/g, "-"),
    },

    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
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

const Color = mongoose.model("Color", colorSchema);

module.exports = Color;
