// src/models/orderModel.js
const mongoose = require("mongoose");

// --- Counter Schema (for auto-incrementing order IDs) ---
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// --- Main Order Schema ---
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },

    // 🧍 Customer who placed the order
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    //  Ordered products
    product: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
         variantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },       
        quantity: { type: Number, required: true, min: 1 },
        discount: { type: Number, default: 0 },
        total: { type: Number },
      },
    ],

    //  Addresses
    billingAddress: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    shippingAddress: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },

    //  Payment Info
    paymentMethod: {
      type: String,
      enum: ["cash", "credit-card", "upi", "bank-transfer"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    //  Order Status
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // 💰 Financial Summary (auto-calculated)
    subTotal: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },

    // 🔗 Misc
    transactionId: { type: String },
    remark: { type: String },
  },
  { timestamps: true, versionKey: false }
);

// --- Pre-save hook to auto-generate totals and orderId ---
orderSchema.pre("save", async function (next) {
  try {
    // Ensure products exist
    if (!this.product || this.product.length === 0) {
      return next(new Error("Order must have at least one product."));
    }

    // Calculate totals
    this.product.forEach((item) => {
      const itemTotal = item.price * item.quantity - (item.discount || 0);
      item.total = itemTotal;
    });

    this.subTotal = this.product.reduce((acc, item) => acc + item.total, 0);
    this.taxAmount = +(this.subTotal * 0.18).toFixed(2);
    this.shippingCharge = this.subTotal > 500 ? 0 : 50;
    this.totalAmount = this.subTotal + this.taxAmount + this.shippingCharge;

    // ✅ Generate unique sequential orderId if new
    if (this.isNew && !this.orderId) {
      const counter = await Counter.findOneAndUpdate(
        { name: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const padded = counter.seq.toString().padStart(4, "0");
      this.orderId = `#ORD-${padded}`;
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
