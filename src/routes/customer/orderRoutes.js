const express = require("express");
const router = express.Router();
const orderController=require("../../controller/customerController/orderController")
const {authenticateUser} = require("../../middleware/authMiddleware");


router.post("/place-order",authenticateUser, orderController.placeOrder);
router.get("/fetch-orders",authenticateUser, orderController.fetchOrders);
router.get("/fetch-order-by-id/:orderId",authenticateUser, orderController.getOrderById);
router.get("/get-available-coupons", orderController.getAvailableCoupons);

module.exports = router;