const express = require('express')
const { getSizeData, getSizeById, addSize, updateSize, deleteSize, bulkDelete } = require('../../controller/adminController/sizeController')
const router = express.Router()

router.get('/size-data', getSizeData)
router.get('/:id', getSizeById)
router.post('/add-size', addSize)
router.put('/update-size/:id', updateSize)
router.delete('/delete-size/:id', deleteSize)
router.delete('/bulk-delete', bulkDelete)

module.exports = router