const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
    },

    package: {
      type: String,
      enum: ["Basic", "Medium", "Advance"],
      default: "Basic",
    },

    userStatus: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
    },

    serviceStatus: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
    },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
