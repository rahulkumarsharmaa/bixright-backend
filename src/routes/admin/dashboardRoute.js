const express = require('express')
const { getDashboardStats, getRecentOrders, getWeeklyRevenue, getMonthlyRevenue, getYearlyRevenue } = require('../../controller/adminController/dashboardController')
const router = express.Router()

router.get('/', getDashboardStats)
router.get('/recent-orders', getRecentOrders)
router.get('/weekly-revenue', getWeeklyRevenue)
router.get('/monthly-revenue', getMonthlyRevenue)
router.get('/yearly-revenue', getYearlyRevenue)

module.exports = router