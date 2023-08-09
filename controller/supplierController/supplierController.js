const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const catchAsyncError = require('../../middleware/catchAsyncError')
const AllUser = require('../../models/alluser')
const ErrorHander = require('../../utils/errorhander')
const sendSupplierToken = require('../../utils/supplierJwtToken')
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('./../../helper/messages')
const { USER_ROLES } = require('./../../config/constants')
const { sendPhoneOTP, sendEmailOTP } = require('./../../helper/sendOTP');
const Supplier = require('../../models/supplier')
const moment = require('moment')
const { default: mongoose } = require('mongoose')
const { getJwtToken } = require('./../../helper/common')
const cloudinary = require('cloudinary')
const constants = require('./../../config/constants')
const bcrypt = require('bcryptjs')

exports.sendOtpByNumber = async (req, res) => {
  try {
    const optRandomvalue = Math.floor(Math.random() * 1000000)
    const { phone } = req.body
    const maskedPhone = maskPhone(phone);
    const userInfo = await Supplier.findOne({ phone }, {_id: 1, phone: 1, is_email_verified: 1, is_phone_verified: 1, role: 1});
    if(userInfo) {
      if (userInfo.is_phone_verified) {
        if (userInfo.email) {
          if (userInfo.email && userInfo.is_email_verified) {
            return res.status(200).json({
              success: true,
              data: {signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_VERIFIED},
              message: `${ERROR_MESSAGES.ALREADY_REGISTERED}`
            })
          } else if (userInfo.email && !userInfo.is_email_verified) {
            await sendEmailOTP(userInfo.email, optRandomvalue)
            await Supplier.updateOne({ phone }, { $set: { email_otp: optRandomvalue, email_otp_expiry: new Date(moment().add(5, 'minutes')) } })
            return res.status(StatusCodes.OK).json({
              succes: true,
              data: {userInfo, signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_PENDING},
              message: SUCCESS_MESSAGES.EMAIL_OTP_SENT_SUCCESSFULLY
            })
          }
        } else {
          return res.status(StatusCodes.OK).json({
            succes: true,
            data: {userInfo, signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_PENDING},
            message: SUCCESS_MESSAGES.PHONE_VERIFIED_VERIFY_EMAIL
          })
        }
      } else {
        await sendPhoneOTP(phone, optRandomvalue)
        await Supplier.updateOne({ _id: mongoose.Types.ObjectId(userInfo._id) }, { phone_otp: optRandomvalue, phone_otp_expiry: new Date(moment().add(5, 'minutes')) })
        return res.status(StatusCodes.OK).json({
          success: true,
          data: {userInfo, signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_PENDING},
          message: `${SUCCESS_MESSAGES.PHONE_OTP_SENT} ${maskedPhone}`
        })
      }
    } else {
      await sendPhoneOTP(phone, optRandomvalue)
      const user = new Supplier({
        phone,
        phone_otp: optRandomvalue,
        phone_otp_expiry: moment().add(5, 'minutes'),
        is_phone_verified: false,
        is_email_verified: false,
        role: USER_ROLES.SUPPLIER
      })
      await user.save()

      const userInfo = await Supplier.findOne({phone}, {_id: 1, phone: 1, is_email_verified: 1, is_phone_verified: 1, role: 1}).lean();
      return res.status(StatusCodes.OK).json({
        success: true,
        data: {userInfo, signupProgress: constants.SIGNUP_PROGRESS.PHONE_PENDING_EMAIL_PENDING},
        message: `${SUCCESS_MESSAGES.PHONE_OTP_SENT} ${req.body.phone}`
      })
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR
    })
  }
}

exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { phone_otp, phone, userId } = req.body

    const userInfo = await Supplier.findOne({ _id: mongoose.Types.ObjectId(userId), phone })
    if (!userInfo) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_REQUEST_USER_NOT_FOUND
      })
    } else if (userInfo && userInfo.is_phone_verified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        data: {signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_PENDING},
        message: ERROR_MESSAGES.PHONE_ALREADY_VERIFIED
      })
    }
    if (userInfo.phone_otp === phone_otp) {
      if (userInfo.phone_otp_expiry > Date.now()) {
        await Supplier.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { is_phone_verified: true, phone_otp: null, phone_otp_expiry: null })
        return res.status(StatusCodes.OK).json({
          succes: true,
          data: {signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_PENDING},
          message: SUCCESS_MESSAGES.PHONE_VERIFIED
        })
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          succes: false,
          message: ERROR_MESSAGES.OTP_EXPIRED
        })
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        succes: false,
        message: ERROR_MESSAGES.INVALID_OTP
      })
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succes: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    })
  } 
}

exports.sendOtpByEmail = async (req, res, next) => {
  try {
    const otp = Math.floor(Math.random() * 1000000)
    const { email, phone, userId } = req.body

    const isExist = await Supplier.findOne({ email })
    if (isExist) {
      if ((isExist._id.toString() === userId) && isExist.is_email_verified) {
        const userInfo = await Supplier.findOne({ _id: mongoose.Types.ObjectId(userId) }, {_id: 1, phone: 1, is_email_verified: 1, is_phone_verified: 1, role: 1, email: 1}).lean();
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: true,
          data: {userInfo, signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_VERIFIED},
          message: ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED_VERIFIED
        })
      } else if ((isExist._id.toString() === userId) && !isExist.is_email_verified) {
        await sendEmailOTP(email, otp)
        await Supplier.updateOne({ email }, { email_otp: otp, email_otp_expiry: moment().add(5, 'minutes') })
        const userInfo = await Supplier.findOne({ _id: mongoose.Types.ObjectId(userId) }, {_id: 1, phone: 1, is_email_verified: 1, is_phone_verified: 1, role: 1, email: 1}).lean();
        return res.status(StatusCodes.OK).json({
          success: true,
          data: {userInfo, signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_PENDING},
          message: SUCCESS_MESSAGES.EMAIL_OTP_SENT_SUCCESSFULLY
        })
      }
    } else {
      await sendEmailOTP(email, otp)
      await Supplier.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { email, email_otp: otp, email_otp_expiry: moment().add(5, 'minutes') })
      const userInfo = await Supplier.findOne({ _id: mongoose.Types.ObjectId(userId) }, {_id: 1, phone: 1, is_email_verified: 1, is_phone_verified: 1, role: 1, email: 1}).lean();
      return res.status(200).json({
        success: true,
        data: {userInfo, signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_PENDING},
        message: SUCCESS_MESSAGES.EMAIL_OTP_SENT_SUCCESSFULLY
      })
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succes: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    })
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const { email_otp, email, userId } = req.body

    let userInfo = await Supplier.findOne({ _id: mongoose.Types.ObjectId(userId), email, is_email_verified: false })
    if (userInfo && userInfo.email_otp === email_otp) {
      if (userInfo.email_otp_expiry > Date.now()) {
        await Supplier.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { is_email_verified: true, email_otp: null, email_otp_expiry: null })
        return res.status(StatusCodes.OK).json({
          succes: true,
          data: { signupProgress: constants.SIGNUP_PROGRESS.PHONE_VERIFIED_EMAIL_VERIFIED },
          message: SUCCESS_MESSAGES.EMAIL_VERIFIED
        })
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          succes: false,
          message: ERROR_MESSAGES.OTP_EXPIRED
        })
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        succes: false,
        message: ERROR_MESSAGES.INVALID_OTP
      })
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succes: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    })
  }
}

// update  Supplier bank details
exports.updateSupplierBankdetails = async (req, res, next) => {
  try {
    const { _id } = req.supplier;
    const bank_details = {
      account_number: req.body.account_number,
      ifsc_code: req.body.ifsc_code
    }

    if (!req.files.cheque_image) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        succes: false,
        message: ERROR_MESSAGES.UPLOAD_CHEQUE_IMAGE
      })
    }

    if (!constants.CHEQUE_IMAGE_MIME_TYPES.includes(req.files.cheque_image.mimetype)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        succes: false,
        message: ERROR_MESSAGES.VALID_CHEQUE_IMAGE_TYPES
      })
    }

    const uploadedMedia = await cloudinary.v2.uploader.upload(req.files.cheque_image.tempFilePath, {
      folder: 'cheques',
      crop: 'scale'
    })

    bank_details.cheque_image = uploadedMedia.secure_url,
  
    await Supplier.findOneAndUpdate(
      { _id },
      { $set:{bank_details}},
    )
    return res.status(StatusCodes.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.BANK_DETAILS_ADDED,
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succes: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    })
  }
}

// update  Supplier bank details
exports.updateSupplierGSTINdetails = async (req, res, next) => {
  try {
    const { _id } = req.supplier;
    const { gstin, pan_number } = req.body

    const gstin_details = {
        gstin: req.body.gstin,
        pan_number: req.body.pan_number
    }

    if (!req.files.pan_image) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        succes: false,
        message: ERROR_MESSAGES.UPLOAD_PAN_IMAGE
      })
    }

    if (!constants.PAN_IMAGE_MIME_TYPES.includes(req.files.pan_image.mimetype)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        succes: false,
        message: ERROR_MESSAGES.VALID_PAN_IMAGE_TYPES
      })
    }

    const uploadedMedia = await cloudinary.v2.uploader.upload(req.files.cheque_image.tempFilePath, {
      folder: 'pan',
      crop: 'scale'
    })

    gstin_details.pan_image = uploadedMedia.secure_url,
  
    await Supplier.findOneAndUpdate(
      { _id },
      { $set:{gstin_details}},
    )
    return res.status(StatusCodes.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.BANK_DETAILS_ADDED,
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succes: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    })
  }
}

// Supplier registration-------------------------------
exports.signupSupplier = async (req, res) => {
  try {
    const { email, phone, password, userId } = req.body

    const supplierInfo = await Supplier.findOne({email, phone, _id: mongoose.Types.ObjectId(userId)}, {password: 0, email_otp: 0, phone_otp: 0, phone_otp_expiry: 0, email_otp_expiry: 0})
    if (!supplierInfo) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        succes: false,
        message: ERROR_MESSAGES.REQUESTED_USER_NOT_AVAILABLE
      })
    }
    const passwordHash = await bcrypt.hash(password, 8);
    await Supplier.updateOne({_id: mongoose.Types.ObjectId(userId)}, {password: passwordHash})
    const jwtToken = await getJwtToken(userId)

    return res.status(StatusCodes.OK).json({
      succes: true,
      data: { supplierInfo, jwtToken },
      message: SUCCESS_MESSAGES.REGISTER_SUCCESSFULLY
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succes: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    })
  }
}

// Supplier login -------------------------------
exports.supplierLogin = async (req, res) => {
  const { identity, password } = req.body

  const query = {
    $or: [
      { email: identity },
      { phone: identity }
    ]
  };
  const supplier = await Supplier.findOne(query).lean();
  if (!supplier) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: ERROR_MESSAGES.INVALID_EMAIL_OR_PHONE });
  }
  const isPasswordMatched = await bcrypt.compareSync(password, supplier.password)

  if (!isPasswordMatched) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      succes: false,
      message: ERROR_MESSAGES.INVALID_PASSWORD
    })
  }
  constants.KEYS_TO_REMOVE_SUPPLIER_RESPONSE.forEach((key) => {
    delete supplier[key];
  });
  
  const jwtToken = await getJwtToken(supplier._id.toString())
  return res.status(StatusCodes.OK).json({
    data: {
      supplier, jwtToken
    },
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS
  })  
}

//  supplier profile --------------------------

exports.getSupplierDetails = catchAsyncError(async (req, res, next) => {
  const supplier = await AllUser.findById(req.supplier.id)

  res.status(200).json({
    success: true,
    supplier
  })
})

// logout Supplier

exports.SupplierLogout = catchAsyncError(async (req, res, next) => {
  res.cookie('flippyseven_supplier_token', null, {
    expires: new Date(Date.now()),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    message: 'logged out succesfully'
  })
})

// update Supplier password

exports.updateSupplierPassword = catchAsyncError(async (req, res, next) => {
  const supplier = await AllUser.findById(req.supplier.id).select('+password')
  const isPasswordMatched = await supplier.comparePassword(
    req.body.oldPassword
  )
  if (!isPasswordMatched) {
    return next(new ErrorHander('Old Password isnot correct', 400))
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander('password does not match', 400))
  }
  supplier.password = req.body.newPassword
  await supplier.save()
  sendSupplierToken(supplier, 200, res)
})

// update Supplier profile
exports.updateSupplierProfile = catchAsyncError(async (req, res, next) => {
  const newSupplierData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  }

  const supplier = await AllUser.findByIdAndUpdate(
    req.supplier.id,
    newSupplierData,
    { new: true, runValidators: true }
  )

  res.status(200).json({
    success: true,
    supplier
  })
})

// register complete Supplier details   no use now
exports.registerAllSupplierdetails = catchAsyncError(async (req, res, next) => {
  //   const supplieralldetails = await Supplier.findOne({supplierProfile:req.supplier.id})

  // if(supplieralldetails){
  //    return next (new ErrorHander("you have filled your details only you can update"))

  // }
  // else{
  const supplier = await Supplier.create({
    // supplierProfile:req.supplier.id,
    gst: req.body.gst,
    pan: req.body.pan,
    pickup_address: {
      house_no: req.body.house_no,
      street: req.body.street,
      landmark: req.body.landmark,
      postal_code: req.body.postal_code,
      city: req.body.city,
      state: req.body.state
    },
    bank_details: {
      account_number: req.body.account_number,
      ifsc_code: req.body.ifsc_code
    }
    // supplier_details:{
    //   store_name:req.body.store_name,
    //   your_name:req.body.your_name
    // }
  })
  console.log(req.body)
  res.status(200).json({
    success: true,
    msg: 'supplier details submitted',
    supplier
  })
  // }
})

// update complete supplier details
exports.updateGstSupplierdetails = catchAsyncError(async (req, res, next) => {
  const updatesupplierdata = {
    supplierProfile: req.supplier.id,
    gst: req.body.gst,
    pan: req.body.pan,
    pickup_address: {
      house_no: req.body.house_no,
      street: req.body.street,
      landmark: req.body.landmark,
      postal_code: req.body.postal_code,
      city: req.body.city,
      state: req.body.state
    },
    bank_details: {
      account_number: req.body.account_number,
      ifsc_code: req.body.ifsc_code
    },
    supplier_details: {
      store_name: req.body.store_name,
      your_name: req.body.your_name
    }
  }

  const supplierDetails = await Supplier.findOne({
    supplierProfile: req.supplier.id
  })
  if (supplierDetails) {
    const updatedSupplierDetails = await Supplier.findOneAndUpdate(
      { supplierProfile: req.supplier.id },
      updatesupplierdata,
      { new: true, runValidators: true }
    )
    res.status(200).json({
      success: true,
      msg: 'supplier details submitted',
      supplierDetails,
      updatedSupplierDetails
    })
  } else {
    const addSupplierDetails = await Supplier.create(updatesupplierdata)
    res.status(200).json({
      success: true,
      msg: 'supplier details submitted',
      addSupplierDetails
    })
  }
})

// update  Supplier Address details
exports.updateSupplierAddressdetails = catchAsyncError(
  async (req, res, next) => {
    const updatesupplierdata = {
      pickup_address: {
        house_no: req.body.house_no,
        street: req.body.street,
        landmark: req.body.landmark,
        postal_code: req.body.postal_code,
        city: req.body.city,
        state: req.body.state
      }
    }

    const supplierDetails = await Supplier.findOne({
      supplierProfile: req.supplier.id
    })
    const updatedSupplierDetails = await Supplier.findOneAndUpdate(
      { supplierProfile: req.supplier.id },
      updatesupplierdata,
      { new: true, runValidators: true }
    )
    res.status(200).json({
      success: true,
      msg: 'supplier details submitted',
      supplierDetails,
      updatedSupplierDetails
    })
  }
)

// update  Supplier supplier shop details
exports.updateSupplierShopdetails = catchAsyncError(async (req, res, next) => {
  const updatesupplierdata = {
    supplier_details: {
      store_name: req.body.store_name,
      your_name: req.body.your_name
    }
  }

  const supplierDetails = await Supplier.findOne({
    supplierProfile: req.supplier.id
  })
  const updatedSupplierDetails = await Supplier.findOneAndUpdate(
    { supplierProfile: req.supplier.id },
    updatesupplierdata,
    { new: true, runValidators: true }
  )
  res.status(200).json({
    success: true,
    msg: 'supplier details submitted',
    supplierDetails,
    updatedSupplierDetails
  })
})

// get all complete Supplier details
exports.AlldetailsOfSupplier = catchAsyncError(async (req, res, next) => {
  const supplieralldetails = await Supplier.findOne({
    supplierProfile: req.supplier.id
  }).populate('supplierProfile')

  if (!supplieralldetails) {
    return next(new ErrorHander('Incomplete details'))
  }
  res.status(200).json({
    success: true,
    supplieralldetails
  })
})


const maskPhone = (phone, num = 3, mask = '*') => {
  return ('' + phone).slice(0, -num).replace(/./g, mask) + ('' + phone).slice(-num);
}
