const AllUser = require('../models/alluser')
const jwt = require('jsonwebtoken')
const ErrorHander = require('../utils/errorhander')
const catchAsyncError = require('../middleware/catchAsyncError')
const { default: mongoose } = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { ERROR_MESSAGES } = require('./../helper/messages')
const Supplier = require('../models/supplier')

// user Authentication
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const token = req.cookies.flippyseven_user_token
  if (!token) {
    return next(new ErrorHander('please login first', 401))
  }
  const decodedata = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await AllUser.findById(decodedata.id)
  next()
})

// Admin Authentication
exports.isAuthenticatedAdmin = catchAsyncError(async (req, res, next) => {
  const admintoken = req.cookies.flippyseven_admin_token
  if (!admintoken) {
    return next(new ErrorHander('please login first', 401))
  }
  const decodedata = jwt.verify(admintoken, process.env.JWT_SECRET_ADMIN)
  req.admin = await AllUser.findById(decodedata.id)
  next()
})

// Supplier Authentication

exports.isAuthenticatedSupplier = catchAsyncError(async (req, res, next) => {
 try {
  const suppliertoken = req.headers.authorization
  if (!suppliertoken) {
    return next(new ErrorHander('Please authenticate', StatusCodes.UNAUTHORIZED))
  }
  const decodedata = jwt.verify(
    suppliertoken,
    process.env.JWT_SECRET_SUPPLIER
  )
  const supplierInfo = await Supplier.findOne({
    _id: mongoose.Types.ObjectId(decodedata.sub)
  })
  req.supplier = supplierInfo
  next()
 } catch (error) {
  return res.status(StatusCodes.UNAUTHORIZED).json({
    succes: false,
    message: ERROR_MESSAGES.SESSION_EXPIRED
  })
 }
})

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(
        new ErrorHander(
                    `Role:${req.admin.role} is not allowed for this resources`,
                    403
        )
      )
    }
    next()
  }
}
