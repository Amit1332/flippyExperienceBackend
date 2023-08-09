const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const { ERROR_MESSAGES } = require('../helper/messages')

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    maxLength: [30, ERROR_MESSAGES.NAME_MAX_LENGTH],
    minLength: [3, ERROR_MESSAGES.NAME_MIN_LENGTH]
  },
  email: {
    type: String,
    validate: [validator.isEmail, ERROR_MESSAGES.VALID_EMAIL]
  },
  email_otp: {
    type: String,
    maxLength: 6
  },
  phone: {
    type: String,
    unique: true,
    maxLength: [10, 'number can not be greater than 10'],
    minLength: [10, 'number can not be less than 10']
  },
  phone_otp: {
    type: String,
    maxLength: 6,
  },
  phone_otp_expiry: { type: Date },
  email_otp_expiry: { type: Date },

  password: {
    type: String,
    trim: true,
    minLength: [8, 'password should be more than 8 character']
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    default: 'user'
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  is_phone_verified: {
    type: Boolean,
    default: false
  },
  bank_details: {
    account_number: {
      type: String,
      unique: true,
    },
    ifsc_code: {
      type: String
    },
    cheque_image: {
      type: String
    }
  },
  gstin_details: {
    gstin: {
      type: String,
      unique: true,
    },
    pan_number: {
      type: String
    },
    pan_image: {
      type: String
    }
  },
  reset_password_token: String,
  reset_password_expire: Date
})

supplierSchema.set('timestamps', true)


// compare password
supplierSchema.static.comparePassword = async function (enteredPassword) {
  return await bcrypt.compareSync(enteredPassword, this.password)
}

module.exports = mongoose.model('Supplier', supplierSchema)
