const express = require("express");
const router = express.Router()
const { authenticateUser } = require("../../middleware/authMiddleware");
const { authorizeUser } = require("../../middleware/roleMiddleware");

const adminPanelSettingRoute = require('./adminPanelSettings')
const attributeRoute = require('./attributeRoute')
const bannerRoute = require("./bannerRoute");
const brandRoute = require("./brandRoute");
const categoryRoute = require("./categoryRoute");
const colorRoute = require("./colorRoute");
const couponRoute = require("./couponRoute");
const customerRoute = require("./customerRoute");
const dashboardRoute = require("./dashboardRoute");
const kycRoute = require("./kycRoute");
const orderRoute = require("./orderRoute");
const productRoute = require("./productRoute");
const productDashboardRoute = require("./productDashboardRoute");
const purchaseRoute = require("./purchaseRoute");
const refundRoute = require("./refundRoute");
const sizeRoute = require("./sizeRoute");
const reviewRoute = require("./reviewRoute");
const stockRoute = require("./stockRoute");
const subCategoryRoute = require("./subCategoryRoute");
const supplierRoute = require("./supplierRoute");
const supportTicketRoute = require("./supportTicketRoute");
const tagRoute = require("./tagRoute");
const unitsRoute = require("./unitsRoute");
const variantRoute = require("./variantRoute");
const userRoute = require("./userRoute");


router.use(authenticateUser)

router.use("/attribute", attributeRoute);
router.use("/setting", adminPanelSettingRoute);
router.use("/brand", brandRoute);
router.use("/banner", bannerRoute);
router.use("/category", categoryRoute);
router.use("/color", colorRoute);
router.use("/coupon", couponRoute);
router.use("/customer", customerRoute);
router.use("/dashboard", dashboardRoute);
router.use("/kyc", kycRoute);
router.use("/order", orderRoute);
router.use("/product", productRoute);
router.use("/product-dashboard", productDashboardRoute);
router.use("/purchase", purchaseRoute);
router.use("/refund", refundRoute);
router.use("/review", reviewRoute);
router.use("/size", sizeRoute);
router.use("/stock", stockRoute);
router.use("/subCategory", subCategoryRoute);
router.use("/supplier", supplierRoute);
router.use("/support", supportTicketRoute);
router.use("/tag", tagRoute);
router.use("/unit", unitsRoute);
router.use("/variant", variantRoute);
router.use("/users", userRoute);

module.exports = router
