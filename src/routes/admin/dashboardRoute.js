const express = require('express')
const { getDashboardStats, getRecentOrders, getWeeklyRevenue } = require('../../controller/adminController/dashboardController')
const router = express.Router()

router.get('/', getDashboardStats)
router.get('/recent-orders', getRecentOrders)
router.get('/weekly-revenue', getWeeklyRevenue )

module.exports = router