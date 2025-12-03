const Policy = require("../../models/policyModel");

// Get Policy (For Admin or Frontend)
exports.getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne({ isActive: true, isDeleted: false });
    if (!policy)
      return res
        .status(404)
        .json({ success: false, message: "No policy found" });

    res.status(200).json({ success: true, policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
