const Brand = require("../../models/brandModel");
const getBrandData = async (req, res) => {
  try {
    // Check if pagination is requested (presence of page or limit)
    // If not, return all data in legacy format for dropdowns/backward compatibility
    if (!req.query.page && !req.query.limit) {
      const brand = await Brand.find({ isDeleted: false }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "Brand Fetched",
        brand,
      });
    }

    let { page = 1, limit = 10, search = "", status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (status) {
      if (status === "true" || status === "active") {
        filter.isActive = true;
      } else if (status === "false" || status === "inactive") {
        filter.isActive = false;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const brand = await Brand.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Brand.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: brand.length === 0 ? "No brand Found" : "Brand Fetched",
      data: {
        data: brand,
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

const getBrandById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "No brand Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "brand Fetched", brand });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addBrand = async (req, res) => {
  try {
    console.log(req.body)
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const lowerTitle = title.toLowerCase()

    const existing = await Brand.findOne({ title: lowerTitle })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Brand Already Exist !",
      });

    }

    const brand = new Brand({
      title,
    });

    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Brand Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!brandId) {
      return res
        .status(400)
        .json({ success: false, message: "BrandId Missing" });
    }

    const brand = await Brand.findByIdAndUpdate(brandId, data, {
      new: true,
    });

    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Brand Updated Successfully",
      brand,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;

    if (!brandId) {
      return res
        .status(400)
        .json({ success: false, message: "BrandId Missing" });
    }

    const check = await Brand.findByIdAndDelete(brandId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Brand Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Brand Deleted Successfully !" });
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
        .json({ success: false, message: "BrandIds Missing" });
    }

    const result = await Brand.updateMany(
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
      message: `${ids.length} Brand Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete 
const softDeleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    res.json({
      success: true,
      message: "Brand  Deleted",
      brand,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBrandData,
  getBrandById,
  addBrand,
  updateBrand,
  deleteBrand,
  bulkDelete,
  softDeleteBrand
};
