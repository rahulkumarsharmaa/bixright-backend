// models/Popup.js
const mongoose = require("mongoose");

const popupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    otherText: {
      type: String,
      trim: true,
      default: "",
    },   
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },   
    isActive: {
      type: Boolean,
      default: true,
    }, 
  },
  { timestamps: true,versionKey: false}
);

module.exports = mongoose.model("Popup", popupSchema);
