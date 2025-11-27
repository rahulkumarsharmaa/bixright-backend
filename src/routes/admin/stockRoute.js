const express = require('express')
const { getStockData, getStockById, addStock, updateStock, deleteStock, bulkDelete, softDeleteStock} = require('../../controller/adminController/stockController')


const router = express.Router()

router.get('/stock-data', getStockData)
router.get('/:id', getStockById)
router.post('/add-stock', addStock)
router.put('/update-stock/:id', updateStock)
router.delete('/delete-stock/:id', deleteStock)
router.delete('/soft-delete-stock/:id', softDeleteStock)
router.delete('/bulk-delete', bulkDelete)

module.exports = router