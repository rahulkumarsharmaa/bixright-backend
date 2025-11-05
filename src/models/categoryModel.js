const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    parentCategory: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      name: { type: String, default: null },
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "InActive",
    },
  },
  { timestamps: true, versionKey: false }
);

categorySchema.pre("validate", function (next) {
  if (this.title && (!this.slug || this.isModified("title"))) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true, // remove special chars
    });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
