const express = require("express");
const router = express.Router();
const tagController = require("../../controller/customerController/tagController");

router.get("/get-tags", tagController.getTagData);

module.exports = router;