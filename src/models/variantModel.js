const mongoose = require("mongoose");
const crypto = require("crypto");

const variantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },

  quantity: {
    type: Number,
    default: 0,
  },

  size: { type: String },
  color: { type: String },

  price: {
    type: Number,
    default: 0,
  },

  image: {
    type: String,
  },

  status: {
    type: String,
    enum: ["instock", "lowstock", "outofstock"],
    default: "instock",
  },
});

variantSchema.pre("save", function (next) {
  if (this.sku) return next();

  if (!this.color || !this.size) {
    return next(new Error("Color and size are required to generate SKU"));
  }

  const randomCode = crypto.randomBytes(2).toString("hex").toUpperCase();

  this.sku = `${this.color}-${this.size}-${randomCode}`.toUpperCase();

  next();
});

const Variant = mongoose.model("Variant", variantSchema);

module.exports = Variant;
