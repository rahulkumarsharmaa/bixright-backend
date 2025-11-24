const express = require("express");
const {
  getReviewData,
  getReviewById,
  addReview,
  updateReview,
  deleteReview,
  bulkDelete,
  softDeleteReview
} = require("../../controller/adminController/reviewController");
const router = express.Router();

router.get("/review-data", getReviewData);
router.get("/:id", getReviewById);
router.post("/add-review", addReview);
router.put("/update-review/:id", updateReview);
router.delete("/delete-review/:id", deleteReview);
router.delete("/soft-delete-review/:id", softDeleteReview);
router.delete("/bulk-delete", bulkDelete);

module.exports = router;
