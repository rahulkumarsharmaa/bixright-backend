const express = require('express')
const { getCustomerData, getCustomerById, addCustomer, updateCustomer, deleteCustomer, bulkDelete, softDeleteCustomer } = require('../../controller/adminController/customerController')
const router = express.Router()

router.get('/customer-data', getCustomerData)
router.get('/:id', getCustomerById)
router.post('/add-customer', addCustomer)
router.put('/update-customer/:id', updateCustomer )
router.delete('/delete-customer/:id', deleteCustomer)
router.delete('/soft-delete-customer/:id', softDeleteCustomer)
router.delete('/bulk-delete', bulkDelete)

module.exports = router