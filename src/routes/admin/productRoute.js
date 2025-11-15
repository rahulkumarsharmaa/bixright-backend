const express = require('express')
const { getProductData, addProduct, updateProduct, deleteProduct, getProductById, bulkDelete } = require('../../controller/adminController/productController')
const { get } = require('mongoose')
const upload = require('../../middleware/multerCloudinaryMiddleware')
const { authenticateUser } = require('../../middleware/authMiddleware')

const router = express.Router()

router.get('/product-data', getProductData)
router.get('/:id', getProductById)
router.post('/add-product', upload.array('images', 10), addProduct)
router.put('/update-product/:id', updateProduct )
router.delete('/delete-product/:id', deleteProduct)
router.delete('/bulk-delete', bulkDelete)

module.exports = router