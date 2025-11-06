const express = require('express')
const { getStockData, getStockById, addStock, updateStock, deleteStock, bulkDelete } = require('../controller/stockController')


const router = express.Router()

router.get('/stock-data', getStockData)
router.get('/:id', getStockById)
router.post('/add-stock', addStock)
router.put('/update-stock/:id', updateStock)
router.delete('/delete-stock/:id', deleteStock)
router.delete('/bulk-delete', bulkDelete)

module.exports = router