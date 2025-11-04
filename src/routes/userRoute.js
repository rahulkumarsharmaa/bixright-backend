const express = require('express')
const { createUser, getAllUsers, updateUser } = require('../controller/userController')

const router = express.Router()

router.get('/users', getAllUsers )
router.post('/create-user', createUser)
router.put('/update-user/:id', updateUser )

module.exports = router