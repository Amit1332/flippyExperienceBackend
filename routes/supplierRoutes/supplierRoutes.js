const express = require('express')
const {
  signupSupplier,
  supplierLogin,
  SupplierLogout,
  getSupplierDetails,
  updateSupplierPassword,
  updateSupplierProfile,
  registerAllSupplierdetails,
  updateAllSupplierdetails,
  updateSupplierBankdetails,
  updateSupplierGSTINdetails,
  updateSupplierAddressdetails,
  updateSupplierShopdetails,
  AlldetailsOfSupplier,
  updateGstSupplierdetails,
  verifyNumber,
  verifyPhoneOTP,
  verifyEmail,
  sendOtpByNumber,
  sendOtpByEmail
} = require('../../controller/supplierController/supplierController')
const supplierAuthValidator = require('./../../validators/supplierAuthValidator')
const { isAuthenticatedSupplier } = require('../../middleware/auth')
const validate = require('./../../middleware/validate');
const Router = express.Router()

Router.route('/phone-otp').post(validate(supplierAuthValidator.sendPhoneOtp), sendOtpByNumber)
Router.route('/verify-phone').post(validate(supplierAuthValidator.verifyPhoneOtp), verifyPhoneOTP)

Router.route('/email-otp').post(sendOtpByEmail)
Router.route('/verify-email').post(verifyEmail)

Router.route('/signup').post(validate(supplierAuthValidator.signup), signupSupplier)
Router.route('/login').post(validate(supplierAuthValidator.login), supplierLogin)

Router.route('/bank-details').post(validate(supplierAuthValidator.bankDetails), isAuthenticatedSupplier, updateSupplierBankdetails)
Router.route('/gstin-details').post(validate(supplierAuthValidator.gstinDetails), isAuthenticatedSupplier, updateSupplierGSTINdetails)

Router.get('/logout', SupplierLogout)
Router.get('/me', isAuthenticatedSupplier, getSupplierDetails)
Router.put('/update-password', isAuthenticatedSupplier, updateSupplierPassword)
Router.put('/update', isAuthenticatedSupplier, updateSupplierProfile)

Router.post('/complete-details', registerAllSupplierdetails)

Router.put('/gst-details', isAuthenticatedSupplier, updateGstSupplierdetails) // gst update and create supplier complete details in supplier
Router.put('/bank-details', isAuthenticatedSupplier, updateSupplierBankdetails)
Router.put('/address', isAuthenticatedSupplier, updateSupplierAddressdetails)
Router.put('/shop-details', isAuthenticatedSupplier, updateSupplierShopdetails)

Router.get('/me/details', isAuthenticatedSupplier, AlldetailsOfSupplier)

module.exports = Router
