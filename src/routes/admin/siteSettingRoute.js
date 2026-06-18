const express = require("express");
const siteSettingController = require("../../controller/adminController/siteSettingController");
const upload = require("../../middleware/multerMiddleware");
const router = express.Router();

router.post(
  "/add-update",
  upload('siteSettings').fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  siteSettingController.upsertSiteSettings
);
router.get("/get", siteSettingController.getSiteSettings);

module.exports = router;
