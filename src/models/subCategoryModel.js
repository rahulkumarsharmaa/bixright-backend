const mongoose = require("mongoose");
const slugify = require("slugify");

const subCategorySchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: null,
    },

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

subCategorySchema.pre("validate", function (next) {
  if (this.title && (!this.slug || this.isModified("title"))) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true, // remove special chars
    });
  }
  next();
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategory;
