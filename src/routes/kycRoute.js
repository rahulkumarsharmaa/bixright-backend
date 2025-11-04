const express = require('express')
const { getKycData, approveKyc, rejectKyc} = require('../controller/kycController')
const router = express.Router()

router.get('/kyc-data', getKycData)
router.put('/approve-kyc/:id', approveKyc)
router.put('/reject-kyc/:id', rejectKyc)

module.exports = router