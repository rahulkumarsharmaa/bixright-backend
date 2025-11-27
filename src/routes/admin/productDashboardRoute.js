const express = require("express");
const {
  getProductCount,
  getTotalRevenue,
  getVariantCount,
  getLowStock
} = require("../../controller/adminController/productDashboardController");

const router = express.Router();
router.get("/total-product", getProductCount);
router.get("/total-revenue", getTotalRevenue);
router.get("/total-variant", getVariantCount);
router.get("/low-stock", getLowStock);

module.exports = router;
