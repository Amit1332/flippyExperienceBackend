const express = require('express')

const router = express.Router()

const userRoutes = require('./userRoutes/userRoutes')
const supplierRoutes = require('./supplierRoutes')
const adminRoutes = require('./adminRoutes')

router.use('/user', userRoutes)
router.use('/supplier', supplierRoutes)
router.use('/admin', adminRoutes)

module.exports = router
