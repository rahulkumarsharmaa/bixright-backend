const express = require('express')
const { getSubCategoryData, getsubCategoryById, addSubCategory, updateSubCategory, deleteSubCategory, bulkDelete, softDeleteSubCategory } = require('../../controller/adminController/subCategoryController')
const upload = require('../../middleware/multerCloudinaryMiddleware')

const router = express.Router()

router.get('/subcategory-data', getSubCategoryData)
router.get('/:id', getsubCategoryById)
router.post('/add-subcategory', upload.single('image'), addSubCategory)
router.put('/update-subcategory/:id',  upload.single('image'), updateSubCategory)
router.delete('/delete-subcategory/:id', deleteSubCategory)
router.delete('/soft-delete-subcategory/:id', softDeleteSubCategory)
router.delete('/bulk-delete', bulkDelete)

module.exports = router