const express = require('express')
const { getBrandData, getBrandById, addBrand, updateBrand, deleteBrand, bulkDelete } = require('../../controller/adminController/brandController')
const router = express.Router()

router.get('/brand-data', getBrandData)
router.get('/:id', getBrandById)
router.post('/add-brand', addBrand)
router.put('/update-brand/:id', updateBrand)
router.delete('/delete-brand/:id', deleteBrand)
router.delete('/bulk-delete', bulkDelete)

module.exports = router