const express = require('express')
const { getProductData, addProduct, updateProduct, deleteProduct, getProductById, bulkDelete, softDeleteProduct } = require('../../controller/adminController/productController')
const { get } = require('mongoose')
const upload = require('../../middleware/multerCloudinaryMiddleware')
const { authenticateUser } = require('../../middleware/authMiddleware')

const router = express.Router()


router.get('/product-data', getProductData)
router.get('/:id', getProductById)
router.post('/add-product', upload.array('images', 10), addProduct)
router.put('/update-product/:id', upload.array('images', 10), updateProduct )
router.delete('/delete-product/:id', deleteProduct)
router.delete('/bulk-delete', bulkDelete)

router.delete('/soft-delete-product/:id', softDeleteProduct)

module.exports = router