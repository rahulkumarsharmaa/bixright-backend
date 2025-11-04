const express = require('express')
const { getAllSupportTickets } = require('../controller/supportTicketController')
const router = express.Router()

router.get('/support-tickets', getAllSupportTickets)

module.exports = router