const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    company: {
      type: String,
    },

    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
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
      addressLine1: {type : String},
      addressLine2: {type : String},
      country: {type : String},
      state: {type : String},
      city: {type : String},
      postalCode: {type : String},
    },

    gstNumber: {
      type: String,
      unique: true,
    },

    panNumber: {
      type: String,
      unique: true,
    },

    bankDetails: {
      accountHolder: {type : String},
      accountNumber: {type : Number},
      bankName: {type : String},
      ifscCode: {type : String},
    },

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

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
