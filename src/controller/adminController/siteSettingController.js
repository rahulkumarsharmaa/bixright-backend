const SiteSettings = require("../../models/siteSettingModel");


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

    // Upload files if provided (Local)
    let logoUrl = null;
    let faviconUrl = null;
    // const baseUrl = process.env.BACKEND_URL;

    if (req.files?.logo?.[0]) {
      const file = req.files.logo[0];
      let fileUrl = file.path.replace(/\\/g, "/");
      logoUrl = `/${fileUrl}`;
    }
    if (req.files?.favicon?.[0]) {
      const file = req.files.favicon[0];
      let fileUrl = file.path.replace(/\\/g, "/");
      faviconUrl = `/${fileUrl}`;
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
