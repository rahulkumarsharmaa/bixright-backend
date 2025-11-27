const express = require('express')
const { getOrderData, getOrderById, addOrder, updateOrder, deleteOrder, bulkDelete, softDeleteOrder } = require('../../controller/adminController/orderController')
const router = express.Router()


router.get('/order-data', getOrderData)
router.get('/:id', getOrderById)
router.post('/add-order', addOrder)
router.put('/update-order/:id', updateOrder )
router.delete('/delete-order/:id', deleteOrder)
router.delete('/soft-delete-order/:id', softDeleteOrder)
router.delete('/bulk-delete', bulkDelete)

module.exports = router