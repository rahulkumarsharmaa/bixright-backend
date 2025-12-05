const Refund = require("../../models/refundModel");

const initiateRefund = async (req, res) => {
  try {
    console.log("Refund Initiated");
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getRefundData = async (req, res) => {
  try {
    const { status } = req.query;
    console.log("status", status);
    const filter = {};
    if (status !== "all") {
      filter.refundStatus = status;
    }
    console.log(filter);
    const refunds = await Refund.find(filter)
      .populate("customer", "firstName lastName email phone")
      .populate("order", "orderId");

    if (!refunds) {
      return res.status(404).json({
        success: false,
        message: "No Refund Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Refunds Fetched",
      refunds,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getRefundById = async (req, res) => {
  try {
    const id = req.params;
    console.log(id);

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Details Missing" });
    }

    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "No Refund Available",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Refund Found", refund });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateRefund = async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id)


  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const softDeleteRefund = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateRefund,
  getRefundData,
  getRefundById,
  updateRefund,
  softDeleteRefund,
};
