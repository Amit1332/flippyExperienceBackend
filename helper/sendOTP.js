const fast2sms = require('fast-two-sms')
const { SUCCESS_MESSAGES } = require('./messages')
const catchAsyncError = require('./../middleware/catchAsyncError')
const sendEmail = require('./../utils/sendEmail')

exports.sendPhoneOTP = catchAsyncError(async (phone, otp) => {
  try {
    const options = {
      authorization: process.env.FAST2SMS_API_KEY,
      message: `${SUCCESS_MESSAGES.VERIFY_OTP} : ${otp}`,
      numbers: [`${phone}`]
    }
  
    return await fast2sms.sendMessage(options)
  } catch (error) {
    return error
  }
})

exports.sendEmailOTP = catchAsyncError(async (email, otp) => {
  const message = `Your Shopbeast Otp is :- \n\n  ${otp} \n\nIf you have not requested this email then, please ignore it.`

  return await sendEmail({
    email,
    subject: SUCCESS_MESSAGES.VERIFY_EMAIL_SUBJECT,
    message
  })
})
