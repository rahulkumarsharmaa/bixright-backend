const express = require('express')
const { initiateRefund } = require('../../controller/adminController/refundController')
const router = express.Router()

router.post('/initiate-refund', initiateRefund)


module.exports = router