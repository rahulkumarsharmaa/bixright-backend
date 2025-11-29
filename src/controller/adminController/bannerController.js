const Banner = require("../../models/bannerModel");
const cloudinary = require("../../config/cloudinaryConfig");
const getBannerData = async (req, res) => {
  try {
    const banner = await Banner.find();
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "No banner Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Banner Fetched", banner });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getBannerById = async (req, res) => {
  const id = req.params;
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
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "banners" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          stream.end(req.file.buffer); // IMPORTANT
        });
      };

      const uploadedImage = await uploadToCloudinary();

      imageData = {
        imageUrl: uploadedImage.secure_url,
        imageId: uploadedImage.public_id,
      };
    }

    // Save banner
    const banner = new Banner({
      title: req.body.title,
      subTitle: req.body.subTitle,
      linkUrl: req.body.linkUrl,
      position: req.body.position,
      status: req.body.status,
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
