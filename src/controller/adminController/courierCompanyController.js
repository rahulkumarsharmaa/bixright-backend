const courierCompanyModel = require("../../models/courierCompanyModel");

const getCourierComapnyData = async (req, res) => {
  try {
    const courierCompany = await courierCompanyModel.find();
    if (!courierCompany) {
      return res
        .status(404)
        .json({ success: false, message: "No Courier Company Found" });
    }

    return res.status(200).json({
      success: true,
      message: "Courier Company Fetched",
      courierCompany,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

module.exports = { getCourierComapnyData };
