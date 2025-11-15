const express = require("express");
const router = express.Router();
const customerController=require("../../controller/customerController/customerController")

// GET /api/categories?limit=10&page=1
router.post("/login", customerController.customerLogin);
router.post("/signup", customerController.customerSignup);

module.exports = router;