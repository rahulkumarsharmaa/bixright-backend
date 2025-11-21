const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
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
    isDeleted:{
        type:Boolean,
        default:false
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
