'use strict'
const express = require('express')

const router = express.Router()

const authRoute = require('./userRoutes')
const productsRoute = require('./productRoutes')

router.route('/auth', authRoute)
router.route('/product', productsRoute)

module.exports = router
