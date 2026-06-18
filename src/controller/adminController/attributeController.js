const Attribute = require("../../models/attributeModel");
const getAttributeData = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (status) {
      if (status === "true" || status === "active") {
        filter.status = "active";
      } else if (status === "false" || status === "inactive") {
        filter.status = "inactive";
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const attribute = await Attribute.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Attribute.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: attribute.length === 0 ? "No Attribute Found" : "Attribute Fetched",
      data: {
        data: attribute,
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAttributeById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const attribute = await Attribute.findById(id);
    if (!attribute) {
      return res
        .status(404)
        .json({ success: false, message: "No Attribute Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Attribute Fetched", attribute });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addAttribute = async (req, res) => {
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

    const existing = await Attribute.findOne({ title: lowerTitle });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attribute Already Exist !",
      });
    }

    const attribute = new Attribute({
      title,
      status,
    });

    await attribute.save();

    return res.status(200).json({
      success: true,
      message: "Attribute Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAttribute = async (req, res) => {
  try {
    const attributeId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!attributeId) {
      return res
        .status(400)
        .json({ success: false, message: "AttributeId Missing" });
    }

    const attribute = await Attribute.findByIdAndUpdate(attributeId, data, {
      new: true,
    });

    if (!attribute) {
      return res
        .status(404)
        .json({ success: false, message: "Attribute not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Attribute Updated Successfully",
      attribute,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAttribute = async (req, res) => {
  try {
    const attributeId = req.params.id;

    if (!attributeId) {
      return res
        .status(400)
        .json({ success: false, message: "AttributeId Missing" });
    }

    const check = await Attribute.findByIdAndDelete(attributeId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Attribute Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Attribute Deleted Successfully !" });
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
        .json({ success: false, message: "AttributeIds Missing" });
    }

    const result = await Attribute.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: `${ids.length} Attribute Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete 
const softDeleteAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!attribute) {
      return res
        .status(404)
        .json({ success: false, message: "Attribute not found" });
    }

    res.json({
      success: true,
      message: "Attribute Deleted",
      attribute,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAttributeData,
  getAttributeById,
  addAttribute,
  updateAttribute,
  deleteAttribute,
  bulkDelete,
  softDeleteAttribute,
};
