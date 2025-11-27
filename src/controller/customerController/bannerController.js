const Banner = require("../../models/bannerModel");

exports.getActiveHeroBanners = async (req, res) => {
  try {
    // Fetch only active banners
    const activeBanners = await Banner.find({ status: "active",position:"hero"});

    // Destructure image field into top-level keys
    const banners = activeBanners.map((banner) => {
      const { image, ...rest } = banner.toObject(); 
      return {
        ...rest,
        ...image, 
      };
    });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active banners",
      error: error.message,
    });
  }
};
