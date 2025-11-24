const express = require("express");
const {

  getVariantData,
  getVariantById,
  addVariant,
  updateVariant,
  deleteVariant,
  bulkDelete,
  softDeleteVariant,
} = require("../../controller/adminController/variantController");
const upload = require("../../middleware/multerCloudinaryMiddleware");

const router = express.Router();


router.get("/variant-data/:id", getVariantData);
router.get("/:id", getVariantById);
router.post("/add-variant", addVariant);
router.put("/update-variant/:id", upload.single("image"), updateVariant);
router.delete("/delete-variant/:id", deleteVariant);
router.delete("/soft-delete-variant/:id", softDeleteVariant);
router.delete("/bulk-delete", bulkDelete);


module.exports = router;
