const Color = require("../../models/colourModel");
const cloudinary = require("../../config/cloudinaryConfig");
const Product = require("../../models/productModel");
const Size = require("../../models/sizeModel");
const Variant = require("../../models/variantModel");

const getVariantData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    console.log(req.params);
    const variant = await Variant.find({
      product: id,
      isDeleted: false,
    }).populate("product", "title");

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "No Variant Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Variant Fetched", variant });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getVariantById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const variant = await Variant.findById(id);
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "No Variant Found" });
    }

    if (variant.isDeleted === true) {
      return res.status(404).json({
        success: false,
        message: "No Variant Found",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Variant Fetched", variant });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addVariant = async (req, res) => {
  try {
    console.log(req.body);
    const { product, color, size } = req.body;

    if (!product || !color || !size) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const productExist = await Product.findById(product);

    if (!productExist) {
      return res
        .status(404)
        .json({ success: false, message: "Product Not Found" });
    }

    const colorData = await Color.findById(color);
    const sizeData = await Size.findById(size);

    console.log(colorData);
    console.log(sizeData);

    const colorTitle = colorData?.title;
    const sizeTitle = sizeData?.title;

    const lowerSize = sizeTitle.toLowerCase();
    const lowerColor = colorTitle.toLowerCase();

    const existing = await Variant.findOne({
      $and: [{ product: product }, { size: lowerSize }, { color: lowerColor }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Variant For This Product Already Exist !",
      });
    }

    const variant = new Variant({
      product: product,
      color: lowerColor,
      size: lowerSize,
    });

    await variant.save();

    return res.status(200).json({
      success: true,
      message: "Variant Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateVariant = async (req, res) => {
  try {
    console.log(req.body);
    const variantId = req.params.id;
    const data = req.body;
    const file = req.file;

    console.log("data", data);
    console.log("file", file);

    let imageUrl = null;

    if (!variantId) {
      return res
        .status(400)
        .json({ success: false, message: "variantId Missing" });
    }

    const variant = await Variant.findByIdAndUpdate(variantId, data, {
      new: true,
    });

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    if (file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "variants" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        stream.end(file.buffer); // upload buffer
      });

      variant.image = uploadResult.secure_url;
      await variant.save();
    }

    return res.status(200).json({
      success: true,
      message: "Variant Updated Successfully",
      variant,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const variantId = req.params.id;

    if (!variantId) {
      return res
        .status(400)
        .json({ success: false, message: "VariantId Missing" });
    }

    const check = await Variant.findByIdAndDelete(variantId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Variant Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Variant Deleted Successfully !" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const bulkDelete = async (req, res) => {
  const { ids } = req.body;
  try {
    if (!ids || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "VariantIds Missing" });
    }

    const result = await Variant.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} Variant Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteVariant = async (req, res) => {
  try {
    const variant = await Variant.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    res.json({
      success: true,
      message: "Variant Deleted",
      variant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVariantData,
  getVariantById,
  addVariant,
  updateVariant,
  deleteVariant,
  bulkDelete,
  softDeleteVariant,
};
