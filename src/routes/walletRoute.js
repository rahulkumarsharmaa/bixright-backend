const express = require('express')
const { getWalletData } = require('../controller/walletController')
const router = express.Router()

router.get('/wallet-transaction', getWalletData)

module.exports = router