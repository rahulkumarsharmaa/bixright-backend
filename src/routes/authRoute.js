const express = require("express");
const {
  register,
  login,
  getMyProfile,
} = require("../controller/authController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { authorizeUser } = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateUser, getMyProfile);

module.exports = router;
