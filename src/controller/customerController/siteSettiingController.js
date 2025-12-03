const SiteSettings = require("../../models/siteSettingModel");

exports.getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    if (!settings)
      return res
        .status(404)
        .json({ success: false, message: "No site settings found" });

    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};