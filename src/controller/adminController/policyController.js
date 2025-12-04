const Policy = require("../../models/policyModel");

//  Create or Update (Upsert) Policy
exports.upsertPolicy = async (req, res) => {
  try {
    const {
      shippingContent,
      minFreeShippingAmount,
      shippingCharge,
      shippingNote,
      returnContent,
      returnPeriodDays,
      returnConditions,
      isActive = true,
      deliveryWithinDays,
    } = req.body;

    // check if policy already exists (we’ll allow only one global policy)
    const existingPolicy = await Policy.findOne({
      isActive: true,
      isDeleted: false,
    });

    let policy;
    if (existingPolicy) {
      // update
      policy = await Policy.findByIdAndUpdate(
        existingPolicy._id,
        {
          shippingContent,
          minFreeShippingAmount,
          shippingCharge,
          shippingNote,
          returnContent,
          returnPeriodDays,
          returnConditions,
          isActive,
          deliveryWithinDays,
        },
        { new: true }
      );
    } else {
      // create
      policy = await Policy.create({
        shippingContent,
        minFreeShippingAmount,
        shippingCharge,
        shippingNote,
        returnContent,
        returnPeriodDays,
        returnConditions,
        isActive,
        deliveryWithinDays,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policy saved successfully",
      policy,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Policy (For Admin or Frontend)
exports.getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne({ isActive: true, isDeleted: false });
    if (!policy)
      return res
        .status(404)
        .json({ success: false, message: "No policy found" });

    res.status(200).json({ success: true, message : 'Policy Fetched', policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
