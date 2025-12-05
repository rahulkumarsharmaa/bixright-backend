const express = require('express')
const upload = require('../../middleware/multerCloudinaryMiddleware')
const { getPopupData, getPopupById, addPopup, updatePopup, deletePopup, softDeletePopup, bulkDelete } = require('../../controller/adminController/popupController')
const router = express.Router()

router.get('/popup-data', getPopupData)
router.get('/:id', getPopupById)
router.post('/add-popup', upload.single('image'), addPopup)
router.put('/update-popup/:id', updatePopup)
router.delete('/delete-popup/:id', deletePopup)
router.delete('/soft-delete-popup/:id', softDeletePopup)
router.delete('/bulk-delete', bulkDelete)

module.exports = router