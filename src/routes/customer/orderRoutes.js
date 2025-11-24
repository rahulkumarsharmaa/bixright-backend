const express = require("express");
const router = express.Router();
const orderController=require("../../controller/customerController/orderController")
const {authenticateUser} = require("../../middleware/authMiddleware");


router.post("/place-order",authenticateUser, orderController.placeOrder);
router.get("/get-available-coupons", orderController.getAvailableCoupons);

module.exports = router;