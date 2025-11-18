const express = require('express')
const { getCouponData, getCouponById, addCoupon, updateCoupon, deleteCoupon, bulkDelete } = require('../../controller/adminController/couponController')
const router = express.Router()

router.get('/coupon-data', getCouponData )
router.get('/:id', getCouponById)
router.post('/add-coupon', addCoupon)
router.put('/update-coupon/:id', updateCoupon)
router.delete('/delete-coupon/:id', deleteCoupon)
router.delete('/bulk-delete', bulkDelete)

module.exports = router