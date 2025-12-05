const express = require("express");
const {
  initiateRefund,
  getRefundData,
  getRefundById,
  updateRefund,
  softDeleteRefund,
} = require("../../controller/adminController/refundController");
const router = express.Router();

router.post("/initiate-refund", initiateRefund);
router.get("/refund-data", getRefundData);
router.put("/update-refund/:id", updateRefund);
router.get("/:id", getRefundById);
router.delete("/soft-delete-refund/:id", softDeleteRefund);

module.exports = router;
