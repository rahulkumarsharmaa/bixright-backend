const express = require("express");
const router = express.Router();
const bannerController=require("../../controller/customerController/bannerController")

// GET /api/categories?limit=10&page=1
router.get("/get-active-hero-banner", bannerController.getActiveHeroBanners);

module.exports = router;