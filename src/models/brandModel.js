const mongoose = require("mongoose");
const slugify = require("slugify");

const brandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase : true
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

brandSchema.pre("validate", function (next) {
  if (this.title && (!this.slug || this.isModified("title"))) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true, // remove special chars
    });
  }
  next();
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
