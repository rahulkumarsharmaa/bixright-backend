const express = require("express");
const router = express.Router();
const reviewController = require("../../controller/customerController/reviewController");
const { authenticateUser } = require("../../middleware/authMiddleware");

router.get("/get-reviews/:productId", reviewController.getReviewsByProduct);
router.post("/add-review", authenticateUser, reviewController.addReview);

module.exports = router;
