const express = require("express");
const router = express.Router();
const CategoryController=require("../../controller/customerController/categoryController")

// GET /api/categories?limit=10&page=1
router.get("/get-active-category", CategoryController.getActiveCategories);
router.get("/get-active-subCategory", CategoryController.getActiveSubCategories);
router.get("/get-active-brands", CategoryController.getActiveBrands);

module.exports = router;