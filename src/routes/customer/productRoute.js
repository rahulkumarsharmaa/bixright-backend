const express = require("express");
const router = express.Router();
const productController=require("../../controller/customerController/productController")


router.get("/get-active-product", productController.getActiveProducts);
router.get("/get-product-by-id/:id", productController.getProductById);
router.get("/fetch-filter",productController.fetchfilter)

module.exports = router;