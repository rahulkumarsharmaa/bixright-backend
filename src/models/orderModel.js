// src/models/orderModel.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // 🧍 Customer who placed the order
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // 🛍️ Ordered products
    product: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // name: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        discount: { type: Number, default: 0 },
        total: { type: Number }, // computed: price * quantity - discount
      },
    ],

    // 🏠 Addresses
    billingAddress: {
      addressLine1: { type: String,  },
      addressLine2: { type: String },
      city: { type: String,  },
      state: { type: String,  },
      country: { type: String,  },
      postalCode: { type: String,  },
    },
    shippingAddress: {
      addressLine1: { type: String,  },
      addressLine2: { type: String },
      city: { type: String,},
      state: { type: String, },
      country: { type: String,  },
      postalCode: { type: String,  },
    },

    // 💳 Payment Info
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

    // 📦 Order Status
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

orderSchema.pre("save", function (next) {
  // Ensure products exist
  if (!this.product || this.product.length === 0) {
    return next(new Error("Order must have at least one product."));
  }

  // Calculate total for each product
  this.product.forEach((item) => {
    const itemTotal = item.price * item.quantity - (item.discount || 0);
    item.total = itemTotal;
  });

  // Calculate subtotal (sum of all products)
  this.subTotal = this.product.reduce((acc, item) => acc + item.total, 0);

  // Example tax (18%)
  this.taxAmount = +(this.subTotal * 0.18).toFixed(2);

  // Example shipping charge (optional logic)
  this.shippingCharge = this.subTotal > 500 ? 0 : 50; // free shipping if > ₹500

  // Total amount
  this.totalAmount = this.subTotal + this.taxAmount + this.shippingCharge;

  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
