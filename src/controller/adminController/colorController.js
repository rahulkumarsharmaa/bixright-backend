const Color = require("../../models/colourModel");

const getColorData = async (req, res) => {
  try {
    // Check if pagination is requested (presence of page or limit)
    // If not, return all data in legacy format for dropdowns/backward compatibility
    if (!req.query.page && !req.query.limit) {
      const color = await Color.find({ isDeleted: false }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "color Fetched",
        color,
      });
    }

    let { page = 1, limit = 10, search = "", status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (status) {
      if (status === "true" || status === "active") {
        filter.isActive = true;
      } else if (status === "false" || status === "inactive") {
        filter.isActive = false;
      }
    }

    const color = await Color.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Color.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: color.length === 0 ? "No color Found" : "color Fetched",
      data: {
        data: color,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
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
    const { title } = req.body;

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

    const result = await Color.updateMany(
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
  softDeleteColor,
};
