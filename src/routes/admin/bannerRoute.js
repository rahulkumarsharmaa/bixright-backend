const express = require('express')
const { getBannerData, getBannerById, addBanner, updateBanner, deleteBanner, bulkDelete } = require('../../controller/adminController/bannerController')
const upload = require('../../middleware/multerCloudinaryMiddleware')
const router = express.Router()

router.get('/banner-data', getBannerData)
router.get('/:id', getBannerById)
router.post('/add-banner', upload.single('image'), addBanner)
router.put('/update-banner/:id', updateBanner)
router.delete('/delete-banner/:id', deleteBanner)
router.delete('/bulk-delete', bulkDelete)

module.exports = router