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
    basePrice: {
      type: Number,
      required: true,
    },
    brand: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
      name: { type: String },
    },
    category: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
      name: { type: String },
    },
    subCategory: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
      name: { type: String },
    },
    size: [
      {
        _id: false,

        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Size",
        },
      },
    ],

    color: [
      {
        _id: false,
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Color",
        },
      },
    ],

    // quantity: {
    //   type: Number,
    //   required: true,
    // },

   isActive:{
    type:Boolean,
    default:true
   },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // isVisible: {
    //   type: Boolean,
    // },

    images: [
      {
        imageUrl: { type: String, required: true },
        imageId: { type: String, required: true },
        isCover: { type: Boolean, default: false }, // Optional: Flag for the main product image
        sortOrder: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
