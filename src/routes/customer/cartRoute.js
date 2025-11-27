const express = require("express");
const router = express.Router();
const cartController = require("../../controller/customerController/cartController");
const { authenticateUser } = require("../../middleware/authMiddleware");

// api to add product in cart as per customer
router.post("/add-to-cart", authenticateUser, cartController.addToCart);
router.get("/get-cart",authenticateUser, cartController.getCartByCustomer);
router.patch("/update-cart",authenticateUser, cartController.updateCart)

module.exports = router;
