const Size = require("../../models/sizeModel");
const getSizeData = async (req, res) => {
  try {
    // Check if pagination is requested (presence of page or limit)
    // If not, return all data in legacy format for dropdowns/backward compatibility
    if (!req.query.page && !req.query.limit) {
      const size = await Size.find({ isDeleted: false }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "Size Fetched",
        size,
      });
    }

    let { page = 1, limit = 10, search = "", status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      if (status === "true" || status === "active") {
        filter.isActive = true;
      } else if (status === "false" || status === "inactive") {
        filter.isActive = false;
      }
    }

    const size = await Size.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Size.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: size.length === 0 ? "No size Found" : "Size Fetched",
      data: {
        data: size,
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

const getSizeById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const size = await Size.findById(id);
    if (!size) {
      return res.status(404).json({ success: false, message: "No size Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "size Fetched", size });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addSize = async (req, res) => {
  try {
    console.log(req.body);
    const { title, code, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const lowerTitle = title.toLowerCase();
    const lowerCode = code.toLowerCase();

    const existingTitle = await Size.findOne({ title: lowerTitle });
    const existingCode = await Size.findOne({ code: lowerCode });

    if (existingTitle) {
      return res.status(400).json({
        success: false,
        message: "Size Already Exist !",
      });
    }

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Size Code Already Exist !",
      });
    }

    const size = new Size({
      title,
      code,
      description,
    });

    await size.save();

    return res.status(200).json({
      success: true,
      message: "Size Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSize = async (req, res) => {
  try {
    const sizeId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!sizeId) {
      return res
        .status(400)
        .json({ success: false, message: "SizeId Missing" });
    }

    const size = await Size.findByIdAndUpdate(sizeId, data, {
      new: true,
    });

    if (!size) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Size Updated Successfully",
      size,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSize = async (req, res) => {
  try {
    const sizeId = req.params.id;

    if (!sizeId) {
      return res
        .status(400)
        .json({ success: false, message: "SizeId Missing" });
    }

    const check = await Size.findByIdAndDelete(sizeId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Size Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Size Deleted Successfully !" });
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
        .json({ success: false, message: "SizeIds Missing" });
    }

    const result = await Size.updateMany(
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
      message: `${ids.length} Size Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteSize = async (req, res) => {
  try {
    const size = await Size.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!size) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found" });
    }

    res.json({
      success: true,
      message: "Size Deleted",
      size,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSizeData,
  getSizeById,
  addSize,
  updateSize,
  deleteSize,
  bulkDelete,
  softDeleteSize,
};
