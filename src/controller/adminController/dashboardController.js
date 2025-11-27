const Customer = require("../../models/customerModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $group: { _id: null, total: { $sum: "$totalAmount" } },
      },
    ]);

    console.error(totalOrders);
    console.error(totalCustomers);
    console.error(totalProducts);
    return res.status(200).json({
      success: true,
      message: "Data Fetched",
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate("product.productId", "imageUrl title price")
      .populate("customer", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10);

    if (!recentOrders) {
      return res
        .status(400)
        .json({ success: false, message: "No Recent Orders Found" });
    }

    return res.json({
      success: true,
      message: "Recent Order Fetched",
      recentOrders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getRecentOrders };
