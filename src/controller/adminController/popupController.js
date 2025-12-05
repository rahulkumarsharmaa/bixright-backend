const Popup = require("../../models/popupModal");
const cloudinary = require("../../config/cloudinaryConfig");
const getPopupData = async (req, res) => {
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

const getPopupById = async (req, res) => {
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

const addPopup = async (req, res) => {
  try {
    let imageData = null;

    // If image exists
    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "popups" },
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

    // Save popup
    const popup = new Popup({
      title: req.body.title,
      subTitle: req.body.subTitle,
      linkUrl: req.body.linkUrl,
      position: req.body.position,
      image: imageData,
    });

    await popup.save();

    return res.status(200).json({
      success: true,
      message: "Popup created successfully",
      popup,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create popup",
      error: error.message,
    });
  }
};

const updatePopup = async (req, res) => {
  try {
    const popupId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!popupId) {
      return res
        .status(400)
        .json({ success: false, message: "PopupId Missing" });
    }

    const popup = await Popup.findByIdAndUpdate(popupId, data, {
      new: true,
    });

    if (!popup) {
      return res
        .status(404)
        .json({ success: false, message: "Popup not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Popup Updated Successfully",
      popup,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePopup = async (req, res) => {
  try {
    const popupId = req.params.id;

    if (!popupId) {
      return res
        .status(400)
        .json({ success: false, message: "PopupId Missing" });
    }

    const check = await Popup.findByIdAndDelete(popupId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Popup Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Popup Deleted Successfully !" });
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
        .json({ success: false, message: "PopupIds Missing" });
    }

    const result = await Popup.updateMany(
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
      message: `${ids.length} Popup Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete 
const softDeletePopup = async (req, res) => {
  try {
    const popup = await Popup.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!popup) {
      return res
        .status(404)
        .json({ success: false, message: "Popup not found" });
    }

    res.json({
      success: true,
      message: "Popup Deleted",
      popup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPopupData,
  getPopupById,
  addPopup,
  updatePopup,
  deletePopup,
  bulkDelete,
  softDeletePopup
};
