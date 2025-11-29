const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subTitle: {
      type: String,
      lowercase: true,
      required: true,
    },
    linkUrl: {
      type: String,
    },

    position: {
      type: String,
      enum: ["hero", "secondary"],
      default: "hero",
    },

    image: {
      imageUrl: { type: String, required: true },
      imageId: { type: String, required: true },
    },
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
  },
  { timestamps: true, versionKey: false }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
