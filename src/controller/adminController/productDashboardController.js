const Order = require("../../models/ordermodel");
const Product = require("../../models/productModel");
const Variant = require("../../models/variantModel");

const getProductCount = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    return res
      .status(200)
      .json({ success: true, message: "Counted", totalProducts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTotalRevenue = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      {
        $group: { _id: null, total: { $sum: "$totalAmount" } },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Counted",
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getVariantCount = async (req, res) => {
  try {
    // const productId = req.params.id;
    // console.log(productId);

    const totalVariants = await Variant.countDocuments();

    console.log(totalVariants);

    return res
      .status(200)
      .json({ success: true, message: "Counted", totalVariants });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getLowStock = async (req, res) => {
  try {
    const lowStockVariant = await Variant.find({ quantity: { $lte: 10 } });

    res
      .status(200)
      .json({
        success: true,
        message: "Low Stock Fetched",
        count: lowStockVariant.length,
        lowStock: lowStockVariant,
      });
      
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProductCount,
  getTotalRevenue,
  getVariantCount,
  getLowStock,
};
