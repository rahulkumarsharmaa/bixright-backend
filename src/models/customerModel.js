const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    dob: {
      type: Date,
      required : true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    phone: {
      type: String,
      unique: [true, "This Number is Already Registered"],
      required: true,
    },
    alternatePhone: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },

    address: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      postalCode: { type: String },
    },

    shippingAddress: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      postalCode: { type: String },
    },

    bankDetails: [
      {
        accountHolderName: { type: String, required: true },
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
        accountType: {
          type: String,
          enum: ["Saving", "Current"],
          default: "Saving",
        },
        branch: { type: String },
        country: { type: String, default: "India" },
      },
    ],

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    orderHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    password: {
      type: String,
    },

    lastLoginAt: { type: Date },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    remark: {
      type: String,
    },
},
  { timestamps: true, versionKey: false }
);

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

module.exports = Customer;
