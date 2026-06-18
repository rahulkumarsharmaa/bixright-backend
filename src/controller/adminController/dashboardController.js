const Customer = require("../../models/customerModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const moment = require("moment");

const getDashboardStats = async (req, res) => {
  try {
    const startOfCurrentMonth = moment().startOf('month');
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month');
    const endOfLastMonth = moment().subtract(1, 'month').endOf('month');

    // 1. Total Counts (All Time)
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Total Revenue (All Time)
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // 2. Current Month Counts
    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfCurrentMonth.toDate() }
    });
    const currentMonthCustomers = await Customer.countDocuments({
      createdAt: { $gte: startOfCurrentMonth.toDate() }
    });
    const currentMonthProducts = await Product.countDocuments({
      createdAt: { $gte: startOfCurrentMonth.toDate() }
    });
    const currentMonthRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfCurrentMonth.toDate() } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const currentMonthRevenue = currentMonthRevenueAgg[0]?.total || 0;

    // 3. Last Month Counts
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() }
    });
    const lastMonthCustomers = await Customer.countDocuments({
      createdAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() }
    });
    const lastMonthProducts = await Product.countDocuments({
      createdAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() }
    });
    const lastMonthRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.total || 0;

    // 4. Calculate Percentage Change
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return (((current - previous) / previous) * 100).toFixed(1);
    };

    const stats = {
      orders: {
        total: totalOrders,
        value: totalOrders, // for consistent naming in frontend
        change: calculateChange(currentMonthOrders, lastMonthOrders),
        isPositive: currentMonthOrders >= lastMonthOrders,
        lastMonth: lastMonthOrders
      },
      customers: {
        total: totalCustomers,
        value: totalCustomers,
        change: calculateChange(currentMonthCustomers, lastMonthCustomers),
        isPositive: currentMonthCustomers >= lastMonthCustomers,
        lastMonth: lastMonthCustomers
      },
      products: {
        total: totalProducts,
        value: totalProducts,
        // Products change is usually about inventory added, so we track new products added
        change: calculateChange(currentMonthProducts, lastMonthProducts),
        isPositive: currentMonthProducts >= lastMonthProducts,
        lastMonth: lastMonthProducts
      },
      revenue: {
        total: totalRevenue,
        value: totalRevenue,
        change: calculateChange(currentMonthRevenue, lastMonthRevenue),
        isPositive: currentMonthRevenue >= lastMonthRevenue,
        lastMonth: lastMonthRevenue
      }
    };

    return res.status(200).json({
      success: true,
      message: "Data Fetched",
      stats
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

const getWeeklyRevenue = async (req, res) => {
  try {
    const today = moment().endOf("day");
    const weekAgo = moment().subtract(6, "days").startOf("day");

    const orders = await Order.find({
      createdAt: {
        $gte: weekAgo.toDate(),
        $lte: today.toDate(),
      },
    });

    let result = [];

    for (let i = 0; i < 7; i++) {
      const day = moment().subtract(i, "days");

      // orders for this day
      const dailyOrders = orders.filter((order) =>
        moment(order.createdAt).isSame(day, "day")
      );

      // sum of revenue
      const dailyRevenue = dailyOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );

      result.push({
        day: day.format("ddd"), // Fri, Sat, Sun...
        value: dailyRevenue,
      });
    }

    result.reverse(); // correct order
    return res.status(200).json({
      success: true,
      message: "Revenue Fetched",
      weeklyRevenue: result,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyRevenue = async (req, res) => {
  try {
    const startOfYear = moment().startOf('year');
    const endOfYear = moment().endOf('year');

    const orders = await Order.find({
      createdAt: {
        $gte: startOfYear.toDate(),
        $lte: endOfYear.toDate(),
      },
    });

    const months = moment.monthsShort(); // Jan, Feb, Mar...
    const result = months.map(month => ({ month, value: 0 }));

    orders.forEach(order => {
      const monthName = moment(order.createdAt).format('MMM');
      const monthData = result.find(m => m.month === monthName);
      if (monthData) {
        monthData.value += (order.totalAmount || 0);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Monthly Revenue Fetched",
      monthlyRevenue: result,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getYearlyRevenue = async (req, res) => {
  try {
    const startOfFiveYearsAgo = moment().subtract(4, 'years').startOf('year');
    const endOfCurrentYear = moment().endOf('year');

    const orders = await Order.find({
      createdAt: {
        $gte: startOfFiveYearsAgo.toDate(),
        $lte: endOfCurrentYear.toDate(),
      },
    });

    // Create array for last 5 years
    const years = [];
    for (let i = 4; i >= 0; i--) {
      years.push({ year: moment().subtract(i, 'years').format('YYYY'), value: 0 });
    }

    orders.forEach(order => {
      const yearName = moment(order.createdAt).format('YYYY');
      const yearData = years.find(y => y.year === yearName);
      if (yearData) {
        yearData.value += (order.totalAmount || 0);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Yearly Revenue Fetched",
      yearlyRevenue: years,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getRecentOrders, getWeeklyRevenue, getMonthlyRevenue, getYearlyRevenue };
