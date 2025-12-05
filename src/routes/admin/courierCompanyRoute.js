const express = require('express')
const { getCourierComapnyData } = require('../../controller/adminController/courierCompanyController')
const router = express.Router()

router.get('/data', getCourierComapnyData )

module.exports = router