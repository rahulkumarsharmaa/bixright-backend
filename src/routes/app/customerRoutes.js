const express = require("express");
const router = express.Router();
const customerController = require("../../controller/appController/customerController");

router.post("/send-otp", customerController.sendOtp);
router.post("/verify-otp", customerController.verifyOtp);

module.exports = router;