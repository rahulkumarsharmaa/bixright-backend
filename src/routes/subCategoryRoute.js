const express = require('express')
const { getSubCategoryData, getsubCategoryById, addSubCategory, updateSubCategory, deleteSubCategory, bulkDelete } = require('../controller/subcategoryController')

const router = express.Router()

router.get('/subcategory-data', getSubCategoryData)
router.get('/:id', getsubCategoryById)
router.post('/add-subcategory', addSubCategory)
router.put('/update-subcategory/:id', updateSubCategory)
router.delete('/delete-subcategory/:id', deleteSubCategory)
router.delete('/bulk-delete', bulkDelete)

module.exports = router