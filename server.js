const express = require('express')
const dotenv = require('dotenv').config()
const  cors = require('cors')
const dbConnection = require('./src/config/dbConfig')
const adminRouter = require('./src/routes/adminRoute')
const userRouter = require('./src/routes/userRoute')
const kycRouter = require('./src/routes/kycRoute')
const walletRouter = require('./src/routes/walletRoute')
const productRouter = require('./src/routes/productRoute')
const supportTicketRouter = require('./src/routes/supportTicketRoute')
const brandRouter = require('./src/routes/brandRoute')
const adminPanelSettingRouter = require('./src/routes/adminPanelSettings')
const categoryRouter = require('./src/routes/categoryRoute')
const app = express()
dbConnection()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use('/api/admin', adminRouter)
app.use('/api/admin', userRouter)
app.use('/api/admin/kyc', kycRouter)
app.use('/api/admin/wallet', walletRouter)
app.use('/api/admin/product', productRouter)
app.use('/api/admin/support', supportTicketRouter)
app.use('/api/admin/brand', brandRouter)
app.use('/api/admin/category', categoryRouter)
app.use('/api/admin/setting', adminPanelSettingRouter)

app.get('/', (req,res)=>{
    res.send('Home')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log(`Server running on PORT : ${PORT}`)

})