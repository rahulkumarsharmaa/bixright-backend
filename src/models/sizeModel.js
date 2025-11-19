const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      set: (v) => v.replace(/\s+/g, "-"),
    },

    code: {
      type: String,
      unique: true,
      lowercase: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
    },
  },
  { timestamps: true, versionKey: false }
);

const Size = mongoose.model("Size", sizeSchema);

module.exports = Size;
