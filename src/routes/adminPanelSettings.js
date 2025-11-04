const express = require('express')
const { singleUpload } = require('../controller/adminPanelSettingController')
const upload = require('../middleware/multerMiddleware')

const router = express.Router()

// router.post('/upload', upload.single('file'), singleUpload)

module.exports = router