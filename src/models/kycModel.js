const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Approved", "Rejected", "Pending"],
      default : 'Pending'
    },
    bussinessName: {
      type: String,
    },
    bussinessAddress: {
      type: String,
    },
    aadhar: {
      type: String,
      required: true,
    },
    pan: {
      type: String,
      required: true,
    },
    frontAadharImageUrl: {
      type: String,
      required: true,
    },
    backAadharImageUrl: {
      type: String,
      required: true,
    },
    panImageUrl: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Kyc = mongoose.model("Kyc", kycSchema);

module.exports = Kyc;
