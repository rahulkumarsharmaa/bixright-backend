const tagModel = require("../../models/tagModel");

exports.getTagData = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;
    const skip = (page - 1) * limit;

    // Fetch tags that are not deleted
    const [tags, totalCount] = await Promise.all([
      tagModel
        .find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      tagModel.countDocuments({ isDeleted: false }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // If no tags found
    if (!tags.length) {
      return res.status(404).json({
        success: false,
        message: "No tags found",
      });
    }

    // Send paginated response
    res.status(200).json({
      success: true,
      message: "Tags fetched successfully",
      data: tags,
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
