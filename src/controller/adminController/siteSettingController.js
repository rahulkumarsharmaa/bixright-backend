const SiteSettings = require("../../models/siteSettingModel");
const cloudinary = require("../../config/cloudinaryConfig");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "siteSettings" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};
//  Add or Update Site Settings
exports.upsertSiteSettings = async (req, res) => {
  try {
    const {
      siteName,
      email,
      phone,
      address,
      aboutUs,
      socialLinks,
      defaultMetaTitle,
      defaultMetaDescription,
      defaultMetaKeywords,
      footerText,
    } = req.body;

    // Upload files if provided
    let logoUrl = null;
    let faviconUrl = null;

    if (req.files?.logo?.[0]) {
      const file = req.files.logo[0];
      const result = await uploadToCloudinary(file.buffer);
      logoUrl = result.secure_url;
    }
    if (req.files?.favicon?.[0]) {
      const favicon = req.files.favicon[0];
      const result = await uploadToCloudinary(favicon.buffer);
      faviconUrl = result.secure_url;
    }

    const existing = await SiteSettings.findOne({});

    let siteSettings;
    if (existing) {
      siteSettings = await SiteSettings.findByIdAndUpdate(
        existing._id,
        {
          siteName,
          email,
          phone,
          address,
          aboutUs,
          socialLinks: socialLinks
            ? JSON.parse(socialLinks)
            : existing.socialLinks,
          defaultMetaTitle,
          defaultMetaDescription,
          defaultMetaKeywords,
          footerText,
          ...(logoUrl && { logoUrl }),
          ...(faviconUrl && { faviconUrl }),
        },
        { new: true }
      );
    } else {
      siteSettings = await SiteSettings.create({
        siteName,
        email,
        phone,
        address,
        aboutUs,
        socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
        defaultMetaTitle,
        defaultMetaDescription,
        defaultMetaKeywords,
        footerText,
        logoUrl,
        faviconUrl,
      });
    }

    res.status(200).json({
      success: true,
      message: "Site settings saved successfully",
      siteSettings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get Site Settings (for frontend)
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
