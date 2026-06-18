const express = require('express')
const { getBannerData, getBannerById, addBanner, updateBanner, deleteBanner, bulkDelete, softDeleteBanner } = require('../../controller/adminController/bannerController')
const upload = require('../../middleware/multerMiddleware')
const router = express.Router()

router.get('/banner-data', getBannerData)
router.get('/:id', getBannerById)
router.post('/add-banner', upload('banner').single('image'), addBanner)
router.put('/update-banner/:id', upload('banner').single('image'), updateBanner)
router.delete('/delete-banner/:id', deleteBanner)
router.delete('/soft-delete-banner/:id', softDeleteBanner)
router.delete('/bulk-delete', bulkDelete)

module.exports = router