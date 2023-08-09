const jwt = require('jsonwebtoken')
const catchAsyncError = require('./../middleware/catchAsyncError');
const moment = require('moment')

exports.getJwtToken = async (userId) => {
  try {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: moment().add(process.env.JWT_EXPIRE_SUPPLIER, 'hours').unix(),
      type: 'access'
    };
    const jwtoken = jwt.sign(payload, process.env.JWT_SECRET_SUPPLIER);
    return jwtoken;
  } catch (error) {
    return error
  }
}
