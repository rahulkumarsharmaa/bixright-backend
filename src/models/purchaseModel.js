const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: {
      type: String,
      unique: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    purchaseDate: {
      type: Date,
      required : true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["cash", "credit", "other"],
      default: "credit",
    },

    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
    },
    paidAmount: {
      type: Number,
      required: true,
    },
    dueAmount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "other", "cheque", "upi", "atm", "creditcard", "other"],
      default: "cash",
    },
    transactionId: {
      type: String,
    //   unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "transit", "received", "returned"],
      default: "pending",
    },
    remark: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

purchaseSchema.pre("validate", function (next) {
  this.totalAmount = this.price * this.quantity - (this.discount || 0);
  this.dueAmount = this.totalAmount - (this.paidAmount || 0);

  next();
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
