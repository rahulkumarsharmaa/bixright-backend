const express = require('express')
const { getSubCategoryData, getsubCategoryById, addSubCategory, updateSubCategory, deleteSubCategory, bulkDelete, softDeleteSubCategory } = require('../../controller/adminController/subCategoryController')
const upload = require('../../middleware/multerMiddleware')

const router = express.Router()

router.get('/subcategory-data', getSubCategoryData)
router.get('/:id', getsubCategoryById)
router.post('/add-subcategory', upload('subCategory').single('image'), addSubCategory)
router.put('/update-subcategory/:id', upload('subCategory').single('image'), updateSubCategory)
router.delete('/delete-subcategory/:id', deleteSubCategory)
router.delete('/soft-delete-subcategory/:id', softDeleteSubCategory)
router.delete('/bulk-delete', bulkDelete)

module.exports = router