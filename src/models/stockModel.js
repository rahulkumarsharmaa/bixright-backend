const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    
    productVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
    },

    reason: {
      type: String,
      enum: ["purchase", "sales"],
    },

    status: {
      type: String,
      enum: ["in", "out"],
      default: "out",
    },

    note: {
      type: String,
      trim: true,
      maxlength: 200,
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

stockSchema.pre("save", function (next) {
  if (this.status === "in") {
    this.reason = "purchase";
  } else if (this.status === "out") {
    this.reason = "sales";
  }
  next();
});

stockSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.status === "in") update.reason = "purchase";
  else if (update.status === "out") update.reason = "sales";
  this.setUpdate(update);
  next();
});

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
