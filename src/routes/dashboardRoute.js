const express = require('express')
const { getDashboardStats, getRecentOrders } = require('../controller/dashboardController')
const router = express.Router()

router.get('/', getDashboardStats)
router.get('/recent-orders', getRecentOrders)

module.exports = router