const express = require("express");
const {
  initiateRefund,
  getRefundData,
  getRefundById,
  softDeleteRefund,
} = require("../../controller/adminController/refundController");
const router = express.Router();

router.post("/initiate-refund", initiateRefund);
router.get("/refund-data", getRefundData);
router.get("/:id", getRefundById);
router.delete("/soft-delete-refund/:id", softDeleteRefund);

module.exports = router;
