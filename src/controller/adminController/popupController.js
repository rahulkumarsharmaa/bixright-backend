const Popup = require("../../models/popupModel");
const cloudinary = require("../../config/cloudinaryConfig");

exports.getPopupData = async (req, res) => {
  try {
    const popup = await Popup.find({isDeleted : false});
    if (!popup) {
      return res
        .status(404)
        .json({ success: false, message: "No popup Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Popup Fetched", popup });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.getPopupById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const popup = await Popup.findById(id);
    if (!popup) {
      return res
        .status(404)
        .json({ success: false, message: "No popup Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "popup Fetched", popup });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

exports.createPopup = async (req, res) => {
  try {
    let image = "";

    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "popup" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          stream.end(req.file.buffer); // IMPORTANT
        });
      };

      const uploadedImage = await uploadToCloudinary();

      image = uploadedImage.secure_url;
    }

    await Popup.updateMany({ isActive: true }, { $set: { isActive: false } });

    const popup = new Popup({
      ...req.body,
      image,
    });

    await popup.save();

    res.status(201).json({
      success: true,
      message: "Popup created successfully",
      popup,
    });
  } catch (error) {
    console.error("Error creating popup:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Update existing popup
 */
exports.updatePopup = async (req, res) => {
  try {
    const popup = await Popup.findById(req.params.id);
    if (!popup) {
      return res
        .status(404)
        .json({ success: false, message: "Popup not found" });
    }

    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "popup" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          stream.end(req.file.buffer); // IMPORTANT
        });
      };

      const uploadedImage = await uploadToCloudinary();

      image = uploadedImage.secure_url;
    }
    req.body.image = image;

    // If activating this popup, deactivate others
    if (req.body.isActive === "true" || req.body.isActive === true) {
      await Popup.updateMany(
        { _id: { $ne: req.params.id }, isActive: true },
        { $set: { isActive: false } }
      );
    }

    const updatedPopup = await Popup.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Popup updated successfully",
      popup: updatedPopup,
    });
  } catch (error) {
    console.error("Error updating popup:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getActivePopup = async (req, res) => {
  try {
    const now = new Date();
    const popup = await Popup.findOne({
      isActive: true,
      $or: [{ endDate: { $gte: now } }, { endDate: null }],
    }).sort({ createdAt: -1 });

    if (!popup) {
      return res
        .status(404)
        .json({ success: false, message: "No active popup found" });
    }

    res.status(200).json({ success: true, popup });
  } catch (error) {
    console.error("Error fetching active popup:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
