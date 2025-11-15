const express = require('express')
const { getAttributeData, getAttributeById, addAttribute, updateAttribute, deleteAttribute, bulkDelete } = require('../../controller/adminController/attributeController')
const router = express.Router()

router.get('/attribute-data', getAttributeData)
router.get('/:id', getAttributeById)
router.post('/add-attribute', addAttribute)
router.put('/update-attribute/:id', updateAttribute)
router.delete('/delete-attribute/:id', deleteAttribute)
router.delete('/bulk-delete', bulkDelete)

module.exports = router