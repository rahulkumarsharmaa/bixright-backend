const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    parentCategory: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      name: { type: String },
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
    },
  },
  { timestamps: true, versionKey: false }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
