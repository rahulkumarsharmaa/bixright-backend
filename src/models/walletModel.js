const mongoose = require("mongoose");
const { generateTransactionId } = require("../helpers/generateTransactionId");

const walletSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    transactionId: {
      type: String,
      default: () => generateTransactionId(),
      required: true,
      unique: true,
    },

    description: {
      type: String,
    },

    type: {
      type: String,
      enum: ["debit", "credit"],
      default: "",
    },

    amount: {
      type: Number,
      required: true,
    },
    openingBalance: {
      type: Number,
    },
    closingBalance: {
      type: Number,
    },
  },
  { timestamps: true, versionKey: false }
);

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
