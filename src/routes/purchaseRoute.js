const express = require('express')
const { getPurchaseData, getPurchaseById, addPurchase, updatePurchase, deletePurchase, bulkDelete } = require('../controller/purchaseController')
const router = express.Router()

router.get('/purchase-data', getPurchaseData)
router.get('/:id', getPurchaseById)
router.post('/add-purchase', addPurchase)
router.put('/update-purchase/:id', updatePurchase )
router.delete('/delete-purchase/:id', deletePurchase)
router.delete('/bulk-delete', bulkDelete)

module.exports = router