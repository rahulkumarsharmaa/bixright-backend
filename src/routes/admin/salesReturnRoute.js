const express = require("express");
const {
  initiateReturn,
  getReturnData,
  getReturnById,
  updateReturn,
  softDeleteReturn,
} = require("../../controller/adminController/salesReturnController");
const router = express.Router();

router.post("/initiate-return", initiateReturn);
router.get("/return-data", getReturnData);
router.put("/update-return/:id", updateReturn);
router.get("/:id", getReturnById);
router.delete("/soft-delete-return/:id", softDeleteReturn);

module.exports = router;
