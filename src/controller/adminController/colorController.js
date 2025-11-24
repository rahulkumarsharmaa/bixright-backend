const Color = require("../../models/colourModel");

const getColorData = async (req, res) => {
  try {
    const color = await Color.find();
    if (!color) {
      return res
        .status(404)
        .json({ success: false, message: "No color Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "color Fetched", color });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getColorById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const color = await Color.findById(id);
    if (!color) {
      return res
        .status(404)
        .json({ success: false, message: "No color Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "color Fetched", color });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addColor = async (req, res) => {
  try {
    console.log(req.body);
    const { title, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const lowerTitle = title.toLowerCase();

    const existing = await Color.findOne({ title: lowerTitle });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Color Already Exist !",
      });
    }

    const color = new Color({
      title: lowerTitle,
      status,
    });

    await color.save();

    return res.status(200).json({
      success: true,
      message: "Color Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateColor = async (req, res) => {
  try {
    const colorId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!colorId) {
      return res
        .status(400)
        .json({ success: false, message: "colorId Missing" });
    }

    const color = await Color.findByIdAndUpdate(colorId, data, {
      new: true,
    });

    if (!color) {
      return res
        .status(404)
        .json({ success: false, message: "color not found" });
    }

    return res.status(200).json({
      success: true,
      message: "color Updated Successfully",
      color,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteColor = async (req, res) => {
  try {
    const colorId = req.params.id;

    if (!colorId) {
      return res
        .status(400)
        .json({ success: false, message: "colorId Missing" });
    }

    const check = await Color.findByIdAndDelete(colorId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "color Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "color Deleted Successfully !" });
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
        .json({ success: false, message: "colorIds Missing" });
    }

    const result = await Color.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} color Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete Product
const softDeleteColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!color) {
      return res
        .status(404)
        .json({ success: false, message: "Color not found" });
    }

    res.json({
      success: true,
      message: "Color Deleted",
      color,

    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getColorData,
  getColorById,
  addColor,
  updateColor,
  deleteColor,
  bulkDelete,
  softDeleteColor
};
