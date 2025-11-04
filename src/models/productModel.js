const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["electronics", "groceries", "clothes", "furniture", "toys"],
      default: "Not Selected",
    },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "N/A"],
      default : 'N/A'
    },
    brand: {
      id : {type : mongoose.Schema.Types.ObjectId, ref : 'Brand'},
      name : {type : String, },
    },
    quantity: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
    },

    imageUrl: { type: String }, // Cloudinary URL
    imageId: { type: String }, // Cloudinary public_id
  },
  { timestamps: true, versionKey: false }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
