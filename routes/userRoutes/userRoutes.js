const express = require('express')
const {
  loginuser,
  logout,
  getUserDetails,
  updatePassword,
  updateProfile,
  registerAlldetails,
  AlldetailsOfUser,
  UpdateAlldetailsOfUser,
  createUserAccount,
  manageAddress,
  updateManageAddress,
  deleteManageAddress,
  getAllManageAddress,
  addBankDetails,
  deleteBankDetails,
  getAllUserDetails,
  updateBankDetails
} = require('../../controller/userController/userController')
const { isAuthenticatedUser } = require('../../middleware/auth')
const Router = express.Router()

Router.route('/signup').post(isAuthenticatedUser, createUserAccount)
Router.route('/login').post(loginuser)
Router.route('/logout').get(logout)
Router.route('/me').get(isAuthenticatedUser, getUserDetails)
Router.route('/update-password').put(isAuthenticatedUser, updatePassword)
Router.route('/update').put(isAuthenticatedUser, updateProfile)

// manage address
Router.route('/create/address').post(isAuthenticatedUser, manageAddress)
Router.route('/update/address/:id').put(
  isAuthenticatedUser,
  updateManageAddress
)
Router.route('/delete/address/:id').delete(
  isAuthenticatedUser,
  deleteManageAddress
)

// bank
Router.route('/create/bank').post(isAuthenticatedUser, addBankDetails)
Router.route('/update/bank/:id').put(isAuthenticatedUser, updateBankDetails)
Router.route('/delete/bank/:id').delete(isAuthenticatedUser, deleteBankDetails)

// get all user-details - bank,address
Router.route('/me/details').get(isAuthenticatedUser, getAllUserDetails)

module.exports = Router
