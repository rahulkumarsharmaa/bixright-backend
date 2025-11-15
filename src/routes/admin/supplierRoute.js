const express = require('express')
const { getSupplierData, getSupplierById, addSupplier, updateSupplier, deleteSupplier, bulkDelete } = require('../../controller/adminController/supplierController')
const router = express.Router()

router.get('/supplier-data', getSupplierData)
router.get('/:id', getSupplierById)
router.post('/add-supplier', addSupplier)
router.put('/update-supplier/:id', updateSupplier )
router.delete('/delete-supplier/:id', deleteSupplier)
router.delete('/bulk-delete', bulkDelete)

module.exports = router