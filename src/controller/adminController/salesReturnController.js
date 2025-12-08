const SalesReturn = require("../../models/salesReturnModel");

const initiateReturn = async (req, res) => {
  try {
    console.log("Return Initiated");
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getReturnData = async (req, res) => {
  try {
    const { status } = req.query;
    console.log("status", status);
    const filter = {};
    if (status !== "all") {
      filter.returnStatus = status;
    }
    console.log(filter);
    const returns = await SalesReturn.find(filter)
      .populate("customer", "firstName lastName email phone")
      .populate("order", "orderId");

    if (!returns) {
      return res.status(404).json({
        success: false,
        message: "No Return Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Returns Fetched",
      returns,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getReturnById = async (req, res) => {
  try {
    const id = req.params;
    console.log(id);

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Details Missing" });
    }

    const returns = await SalesReturn.findById(id);

    if (!returns) {
      return res.status(404).json({
        success: false,
        message: "No Return Available",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Return Found", returns });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateReturn = async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id)


  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const softDeleteReturn = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateReturn,
  getReturnData,
  getReturnById,
  updateReturn,
  softDeleteReturn,
};
