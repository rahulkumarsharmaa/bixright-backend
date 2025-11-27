const express = require('express')
const { getColorData, getColorById, addColor, updateColor, deleteColor, bulkDelete, softDeleteColor } = require('../../controller/adminController/colorController')

const router = express.Router()

router.get('/color-data', getColorData)
router.get('/:id', getColorById)
router.post('/add-color', addColor)
router.put('/update-color/:id', updateColor)
router.delete('/delete-color/:id', deleteColor)
router.delete('/soft-delete-color/:id', softDeleteColor)
router.delete('/bulk-delete', bulkDelete)

module.exports = router