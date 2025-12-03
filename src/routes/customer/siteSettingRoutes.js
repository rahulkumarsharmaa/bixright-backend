const express = require("express");
const router = express.Router();
const siteSettiingController=require("../../controller/customerController/siteSettiingController")


router.get("/get", siteSettiingController.getSiteSettings);

module.exports = router;