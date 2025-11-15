const express = require('express')
const { getAllSupportTickets } = require('../../controller/adminController/supportTicketController')
const router = express.Router()

router.get('/support-tickets', getAllSupportTickets)

module.exports = router