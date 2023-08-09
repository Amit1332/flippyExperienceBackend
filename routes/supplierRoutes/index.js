'use strict'
const express = require('express')

const router = express.Router()

const authRoute = require('./supplierRoutes')
const productsRoute = require('./productRoutes')
const couponRoute = require('./couponRoutes')

router.use('/auth', authRoute)
router.use('/product', productsRoute)
router.use('/coupon', couponRoute)

module.exports = router
