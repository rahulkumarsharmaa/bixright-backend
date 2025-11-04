const Kyc = require("../models/kycModel");

const getKycData = async (req, res) => {
  try {
    const kycs = await Kyc.find();

    if (!kycs) {
      return res
        .status(404)
        .json({ success: false, message: "No Kyc data found !" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Kyc Fetched Successfully !", kycs });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const approveKyc = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status Missing" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId Missing" });
    }

    const kyc = await Kyc.findByIdAndUpdate(
      userId,
      { status: status },
      { new: true }
    );

    if (!kyc) {
      return res
        .status(404)
        .json({ success: false, message: "No KYC Found for given Id" });
    }

    return res
      .status(200)
      .json({ success: true, message: "KYC Approved", kyc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectKyc = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status Missing" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId Missing" });
    }

    const kyc = await Kyc.findByIdAndUpdate(
      userId,
      { status: status },
      { new: true }
    );

    if (!kyc) {
      return res
        .status(404)
        .json({ success: false, message: "No KYC Found for given Id" });
    }

    return res
      .status(200)
      .json({ success: true, message: "KYC Rejected", kyc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getKycData, approveKyc, rejectKyc };
