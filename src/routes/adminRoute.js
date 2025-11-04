const express = require('express')
const { register, login } = require('../controller/adminController')
const { authenticateUser } = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/register', register )
router.post('/login', login ) 
router.get('/create-user', authenticateUser)

module.exports = router