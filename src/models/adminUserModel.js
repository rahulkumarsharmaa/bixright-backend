const { request } = require("express");
const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    phone : {
      type : String,
      required : true
    },

    role: {
      type: String,
      enum: ["admin", "manager", "staff", "customer"],
      default: "customer",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    location: {
      ip: String,
      city: String,
      region: String,
      country: String,
      timezone: String,
      loginAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true, versionKey: false }
);

const Admin = mongoose.model("Admin", adminUserSchema);

module.exports = Admin;
