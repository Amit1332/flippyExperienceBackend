const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const validator = require('validator')
const { log } = require('console')

const alluserSchema = new mongoose.Schema({
  name: {
    type: String,
    maxLength: [30, 'name cannot exceed 30 character'],
    minLength: [5, 'name cannot less than 5 character']
  },
  email: {
    type: String,
    // required:[true,"please enter your email address"],
    unique: true,
    validate: [validator.isEmail, 'please enter your valid email address']
  },
  otp_email: {
    type: String,
    maxLength: [6, 'please enter your otp'],
    select: false
  },
  otp_mobile: {
    type: String,
    maxLength: [6, 'please enter your otp'],
    select: false
  },
  otp_mobile_expiry: Date,
  otp_email_expiry: Date,

  phone: {
    type: String,
    unique: true,
    maxLength: [10, 'number can not be greater than 10'],
    minLength: [10, 'number can not be less than 10']
  },

  password: {
    type: String,
    // required:[true,"please enter your password"],
    minLength: [8, 'password should be more than 8 character']
  },
  avatar: {
    public_id: {
      type: String
      // required:true
    },
    url: {
      type: String
      // required:true
    }
  },

  role: {
    type: String,
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  },

  resetPasswordToken: String,
  resePasswordExpire: Date
})

alluserSchema.set('timestamps', true)

//  hash password
alluserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  this.password = await bcrypt.hash(this.password, 10)
})

//  jsonwebtoken JWT for user
alluserSchema.methods.getJWTTOKEN = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// for admin
alluserSchema.methods.getJWTTOKENADMIN = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_ADMIN, {
    expiresIn: process.env.JWT_EXPIRE_ADMIN
  })
}

// for supplier
alluserSchema.methods.getJWTTOKENSUPPLIER = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_SUPPLIER, {
    expiresIn: process.env.JWT_EXPIRE_SUPPLIER
  })
}

// compare password

alluserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compareSync(enteredPassword, this.password)
}

// hash mobile otp
// alluserSchema.pre('save',async function(next){
//     if(!this.isModified('otp_mobile')){
//         next()
//     }

//     this.otp_mobile =await bcrypt.hash(this.otp_mobile, 10)
// })

// alluserSchema.pre('save',async function(next){
//     if(!this.isModified('otp_email')){
//         next()
//     }

//     this.otp_email =await bcrypt.hash(this.otp_email, 10)
// })

// // verify mobile otp
// alluserSchema.methods.verifyMobileOtp = async function(enteredOtp){
//     return await bcrypt.compareSync(enteredOtp,this.otp_mobile)
//     }

//     alluserSchema.methods.verifyEmailOtp = async function(enteredOtp){
//         return await bcrypt.compareSync(enteredOtp,this.otp_email)
//  }

alluserSchema.index({ otp_mobile_expiry: 1 }, { expireAfterSeconds: 0 })
alluserSchema.index({ otp_email_expiry: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('AllUser', alluserSchema)
