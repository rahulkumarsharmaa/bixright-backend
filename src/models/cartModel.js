const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
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
    quantity:{
        type:Number,
        default:1
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("cart", cartSchema);
