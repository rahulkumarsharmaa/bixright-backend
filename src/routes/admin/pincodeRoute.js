const express = require('express')
const pincodeController = require('../../controller/adminController/pincodeController')
const router = express.Router()

router.get('/fetch-pin-codes', pincodeController.getPincodes)
router.patch('/update-pincode-status', pincodeController.updatePincodeStatus)

module.exports = router