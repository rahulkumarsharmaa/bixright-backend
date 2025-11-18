const express = require("express");
const {
  getVariantData,
  getVariantById,
  addVariant,
  updateVariant,
  deleteVariant,
  bulkDelete,
} = require("../../controller/adminController/variantController");

const router = express.Router();

router.get("/variant-data/:id", getVariantData);
router.get("/:id", getVariantById);
router.post("/add-variant", addVariant);
router.put("/update-variant/:id", updateVariant);
router.delete("/delete-variant/:id", deleteVariant);
router.delete("/bulk-delete", bulkDelete);

module.exports = router;
