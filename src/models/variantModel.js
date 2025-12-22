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
    unique: true,
    uppercase: true,
    trim: true,
  },

  quantity: {
    type: Number,
    default: 0,
  },

  size: {
    type: String,
    lowercase: true,
    trim: true,
    set: (v) => v.replace(/\s+/g, "-"),
  },

  color: {
    type: String,
    lowercase: true,
    trim: true,
    set: (v) => v.replace(/\s+/g, "-"),
  },

  price: {
    type: Number,
    default: 0,
  },
  discountedPrice: {
    type: Number,
    default: function () {
      return this.price;
    },
  },

  image: {
    type: String,
    default: null,
  },

  status: {
    type: String,
    enum: ["instock", "lowstock", "outofstock"],
    default: "instock",
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
  // deletedAt: {
  //   type: Date,
  //   default: null,
  // },
});

variantSchema.pre("findOneAndUpdate", function (next) {
  this.setOptions({ runValidators: true });
  next();
});

variantSchema.pre(["save", "findOneAndUpdate"], function (next) {
  let data = this;

  // For findOneAndUpdate, the data is inside getUpdate()
  if (this.getUpdate) {
    data = this.getUpdate();
  }

  const qty = data.quantity;

  if (qty !== undefined) {
    if (qty <= 0) data.status = "outofstock";
    else if (qty <= 10) data.status = "lowstock";
    else data.status = "instock";

    if (this.getUpdate) {
      this.setUpdate(data);
    }
  }

  next();
});

variantSchema.pre("save", function (next) {
  if (!this.sku) {
    const randomCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    const size = this.size ? this.size.toUpperCase() : "NA";
    const color = this.color ? this.color.toUpperCase() : "NA";

    this.sku = `SKU-${size}-${color}-${randomCode}`;
  }

  next();
});

// variantSchema.pre("save", function (next) {
//   if (this.quantity <= 0) {
//     this.status = "outofstock";
//   } else if (this.quantity <= 10) {
//     this.status = "lowstock";
//   } else {
//     this.status = "instock";
//   }
//   next();
// });

const Variant = mongoose.model("Variant", variantSchema);

module.exports = Variant;
