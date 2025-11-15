const express = require('express')
const { getDashboardStats, getRecentOrders } = require('../../controller/adminController/dashboardController')
const router = express.Router()

router.get('/', getDashboardStats)
router.get('/recent-orders', getRecentOrders)

module.exports = router