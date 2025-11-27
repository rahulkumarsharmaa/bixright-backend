const express = require('express')
const { createUser, getUserById, getAllUsers, updateUser, softDeleteUser } = require('../../controller/adminController/userController')

const router = express.Router()

router.get('/user-data', getAllUsers)
router.get('/:id', getUserById)
router.post('/add-user', createUser)
router.put('/update-user/:id', updateUser )
router.delete('/soft-delete-user/:id', softDeleteUser)


module.exports = router