const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
