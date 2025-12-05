const express = require("express");
const router = express.Router();
const popupController=require("../../controller/customerController/popupController")


router.get("/get", popupController.getActivePopup);

module.exports = router;