'use strict'
const express = require('express')
const Router = express.Router()

const authRoute = require('./adminRoutes')
const productRoute = require('./productRoutes')
const categoryRoute = require('./categoryRoutes')
const attributeRoute = require('./attributeRoutes')
const blogRoute = require('./blogRoutes')

Router.route('/auth', authRoute)
Router.route('/product', productRoute)
Router.route('/category', categoryRoute)
Router.route('/attributes', attributeRoute)
Router.route('/blog', blogRoute)

module.exports = Router
