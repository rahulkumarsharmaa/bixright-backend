const express = require('express')
const policyController = require('../../controller/adminController/policyController')
const router = express.Router()

router.post('/add-update-policy', policyController.upsertPolicy)
router.get('/get-policy', policyController.getPolicy)

module.exports = router