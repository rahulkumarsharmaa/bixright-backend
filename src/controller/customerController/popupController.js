const Popup = require("../../models/popupModel");

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

    res
      .status(200)
      .json({ success: true, popup, message: "Popup fetched successfully" });
  } catch (error) {
    console.error("Error fetching active popup:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
