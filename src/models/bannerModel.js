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
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true, versionKey: false }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
