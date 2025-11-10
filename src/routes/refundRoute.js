const express = require('express')
const { initiateRefund } = require('../controller/refundController')
const router = express.Router()

router.post('/initiate-refund', initiateRefund)


module.exports = router