const Variant = require("../../models/variantModel");
const getVariantData = async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id);
    console.log(req.params);
    const variant = await Variant.find({ product: id });
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
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const lowerName = name.toLowerCase();

    const existing = await Variant.findOne({ name: lowerName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Variant Already Exist !",
      });
    }

    const variant = new Variant({
      name: lowerName,
      status,
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
    console.log(data);

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

module.exports = {
  getVariantData,
  getVariantById,
  addVariant,
  updateVariant,
  deleteVariant,
  bulkDelete,
};
