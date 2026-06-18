const Banner = require("../../models/bannerModel");

const getBannerData = async (req, res) => {
  try {
    // Check if pagination is requested
    if (!req.query.page && !req.query.limit) {
      const banner = await Banner.find({ isDeleted: false }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "Banner Fetched",
        banner,
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
        { subTitle: { $regex: search, $options: "i" } },
      ];
    }

    const banner = await Banner.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Banner.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: banner.length === 0 ? "No banner Found" : "Banner Fetched",
      data: {
        data: banner,
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

const getBannerById = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const banner = await Banner.findById(id);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "No banner Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "banner Fetched", banner });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addBanner = async (req, res) => {
  try {
    let imageData = null;

    // If image exists
    if (req.file) {
      let fileUrl = req.file.path.replace(/\\/g, "/");

      imageData = {
        imageUrl: `/${fileUrl}`,
        imageId: req.file.path,
      };
    }

    // Save banner
    const banner = new Banner({
      title: req.body.title,
      subTitle: req.body.subTitle,
      linkUrl: req.body.linkUrl,
      position: req.body.position,
      image: imageData,
    });

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create banner",
      error: error.message,
    });
  }
};

const updateBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!bannerId) {
      return res
        .status(400)
        .json({ success: false, message: "BannerId Missing" });
    }

    const banner = await Banner.findByIdAndUpdate(bannerId, data, {
      new: true,
    });

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Banner Updated Successfully",
      banner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;

    if (!bannerId) {
      return res
        .status(400)
        .json({ success: false, message: "BannerId Missing" });
    }

    const check = await Banner.findByIdAndDelete(bannerId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Banner Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Banner Deleted Successfully !" });
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
        .json({ success: false, message: "BannerIds Missing" });
    }

    const result = await Banner.updateMany(
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
      message: `${ids.length} Banner Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete 
const softDeleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    res.json({
      success: true,
      message: "Banner Deleted",
      banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBannerData,
  getBannerById,
  addBanner,
  updateBanner,
  deleteBanner,
  bulkDelete,
  softDeleteBanner
};
