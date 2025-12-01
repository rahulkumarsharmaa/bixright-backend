const express = require("express");
const {
  getTagData,
  getTagById,
  addTag,
  updateTag,
  deleteTag,
  bulkDelete,
  softDeleteTag,
} = require("../../controller/adminController/tagController");
const upload = require("../../middleware/multerCloudinaryMiddleware");
const router = express.Router();

router.get("/tag-data", getTagData);
router.get("/:id", getTagById);
router.post("/add-tag", upload.array("images", 2), addTag);
router.put("/update-tag/:id", upload.array("images", 2), updateTag);
router.delete("/delete-tag/:id", deleteTag);
router.delete("/soft-delete-tag/:id", softDeleteTag);
router.delete("/bulk-delete", bulkDelete);

module.exports = router;
