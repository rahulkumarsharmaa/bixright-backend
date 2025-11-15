const express = require('express')
const { getUnitData, getUnitById, addUnit, updateUnit, deleteUnit, bulkDelete } = require('../../controller/adminController/unitsController')
const router = express.Router()

router.get('/unit-data', getUnitData)
router.get('/:id', getUnitById)
router.post('/add-unit', addUnit)
router.put('/update-unit/:id', updateUnit)
router.delete('/delete-unit/:id', deleteUnit)
router.delete('/bulk-delete', bulkDelete)

module.exports = router