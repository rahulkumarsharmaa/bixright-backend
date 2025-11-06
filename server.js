const express = require('express')
const dotenv = require('dotenv').config()
const  cors = require('cors')
const dbConnection = require('./src/config/dbConfig')
const adminRouter = require('./src/routes/adminRoute')
const userRouter = require('./src/routes/userRoute')
const kycRouter = require('./src/routes/kycRoute')
const productRouter = require('./src/routes/productRoute')
const supportTicketRouter = require('./src/routes/supportTicketRoute')
const brandRouter = require('./src/routes/brandRoute')
const adminPanelSettingRouter = require('./src/routes/adminPanelSettings')
const categoryRouter = require('./src/routes/categoryRoute')
const unitRouter = require('./src/routes/unitsRoute')
const attributeRouter = require('./src/routes/attributeRoute')
const sizeRouter = require('./src/routes/sizeRoute')
const colorRouter = require('./src/routes/colorRoute')
const stockRouter = require('./src/routes/stockRoute')
const tagRouter = require('./src/routes/tagRoute')
const purchaseRouter = require('./src/routes/purchaseRoute')
const supplierRouter = require('./src/routes/supplierRouter')

const app = express()
dbConnection()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use('/api/admin', adminRouter)
app.use('/api/admin', userRouter)

app.use('/api/admin/product', productRouter)
app.use('/api/admin/attribute', attributeRouter)
app.use('/api/admin/unit', unitRouter)
app.use('/api/admin/category', categoryRouter)
app.use('/api/admin/size', sizeRouter)
app.use('/api/admin/color', colorRouter)
app.use('/api/admin/brand', brandRouter)
app.use('/api/admin/stock', stockRouter)
app.use('/api/admin/tag', tagRouter )

app.use('/api/admin/purchase', purchaseRouter )
app.use('/api/admin/supplier', supplierRouter )

app.use('/api/admin/support', supportTicketRouter)
app.use('/api/admin/kyc', kycRouter)
app.use('/api/admin/setting', adminPanelSettingRouter)

app.get('/', (req,res)=>{
    res.send('Home')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log(`Server running on PORT : ${PORT}`)

})