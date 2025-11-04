const Wallet = require("../models/walletModel");

const getWalletData = async (req, res) => {
  try {
    const wallet = await Wallet.find();

    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "No Data Available" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Wallet Details Fetched", wallet });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWalletData };
