const express = require("express");
const router = express.Router();
const wishlistController = require("../../controller/customerController/wishlistController");
const {authenticateUser} = require("../../middleware/authMiddleware");

router.post("/add-to-wishlist", authenticateUser, wishlistController.addToWishlist);
router.get("/get-wishlist", authenticateUser, wishlistController.getWishlist);
router.patch("/delete-wishlist-item/:id", authenticateUser, wishlistController.deleteWishlistItem);

module.exports = router;
