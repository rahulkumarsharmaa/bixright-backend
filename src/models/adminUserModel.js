const { request } = require('express')
const mongoose = require('mongoose')

const adminUserSchema = new mongoose.Schema({
    name : {
        type : String,
    },
     email : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
}, {timestamps : true, versionKey : false})

const Admin = mongoose.model('Admin', adminUserSchema)

module.exports = Admin