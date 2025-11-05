const mongoose = require("mongoose");

const unitScheme = new mongoose.Schema(
  {
    name : {
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

const Unit = mongoose.model("Unit", unitScheme);

module.exports = Unit;
