const express = require('express')
const { getCategoryData, getcategoryById, addCategory, updateCategory, deleteCategory, bulkDelete } = require('../../controller/adminController/categoryController')
const router = express.Router()

router.get('/category-data', getCategoryData)
router.get('/:id', getcategoryById)
router.post('/add-category', addCategory)
router.put('/update-category/:id', updateCategory)
router.delete('/delete-category/:id', deleteCategory)
router.delete('/bulk-delete', bulkDelete)

module.exports = router