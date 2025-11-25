const pincodeModel = require("../../models/pincodeModel");

exports.getPincodes = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      state,
      city,
      area,
      isActive,
      search,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = {};

    // Apply filters
    if (state) filter.state = new RegExp(state, "i");
    if (city) filter.city = new RegExp(city, "i");
    if (area) filter.area = new RegExp(area, "i");

    if (search) {
      filter.$or = [
        { code: new RegExp(search, "i") },
        { area: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
        { state: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      pincodeModel
        .find(filter)
        .sort({ state: 1, city: 1 })
        .skip(skip)
        .limit(limit),
      pincodeModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

exports.updatePincodeStatus = async (req, res) => {
  try {
    const { ids, isActive } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of Pincode IDs",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const result = await pincodeModel.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} pincodes successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};
