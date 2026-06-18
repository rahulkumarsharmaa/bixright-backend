const Color = require("../../models/colourModel");

const Product = require("../../models/productModel");
const Size = require("../../models/sizeModel");
const Variant = require("../../models/variantModel");

const getVariantData = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    console.log(status);
    const filter = { product: id, isDeleted: false };

    if (status && status !== "all") {
      filter.status = status;
    }

    const variant = await Variant.find(filter).populate("product", "title");

    if (!variant || variant.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No Variant Found", variant: [] });
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
    let variant = await Variant.findById(variantId);

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    const product = await Product.findById(variant.product);

    let discountPercentage = product.discount || 0;
    let discountedPrice = Math.round(
      variant.price * (1 - (discountPercentage || 0) / 100)
    );
    data.discountedPrice = discountedPrice;

    variant = await Variant.findByIdAndUpdate(variantId, data, {
      new: true,
    });

    console.log("variant", variant);

    //find and update same colour variant
    const sameColorVariant = await Variant.find({ color: variant.color });

    console.log("samecolor", sameColorVariant);

    if (file) {
      // const baseUrl = process.env.BACKEND_URL;
      let fileUrl = file.path.replace(/\\/g, "/");
      variant.image = `/${fileUrl}`;
      await variant.save();
    }

    // await Variant.updateMany(
    //   {product : variant.product ,  color : variant.color },
    //   {
    //     $set: { image: uploadResult.secure_url },
    //   }
    // );

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

    const result = await Variant.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }
    );

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
    console.log("params", req.params);
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
