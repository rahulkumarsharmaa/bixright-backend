const express = require('express')
const { getCategoryData, getcategoryById, addCategory, updateCategory, deleteCategory, bulkDelete, softDeleteCategory } = require('../../controller/adminController/categoryController')
const upload = require('../../middleware/multerMiddleware')
const router = express.Router()

router.get('/category-data', getCategoryData)
router.get('/:id', getcategoryById)
router.post('/add-category', upload('category').single('image'), addCategory)
router.put('/update-category/:id', upload('category').single('image'), updateCategory)
router.delete('/delete-category/:id', deleteCategory)
router.delete('/soft-delete-category/:id', softDeleteCategory)
router.delete('/bulk-delete', bulkDelete)

module.exports = router