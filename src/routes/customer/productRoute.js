const express = require("express");
const router = express.Router();
const productController=require("../../controller/customerController/productController")


router.get("/get-active-product", productController.getActiveProducts);

module.exports = router;