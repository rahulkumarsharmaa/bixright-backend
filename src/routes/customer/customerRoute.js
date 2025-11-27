const express = require("express");
const router = express.Router();
const customerController=require("../../controller/customerController/customerController");
const { authenticateUser } = require("../../middleware/authMiddleware");

// GET /api/categories?limit=10&page=1
router.post("/login", customerController.customerLogin);
router.post("/signup", customerController.customerSignup);
router.get("/get-profile", authenticateUser,customerController.getCustomerProfile);
router.patch("/update-profile",authenticateUser, customerController.updateCustomerProfile);

module.exports = router;