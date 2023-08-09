const Joi = require('joi')
const { password } = require('./custom.validation')
const { objectId } = require('./custom.validation');

const sendPhoneOtp = {
  body: Joi.object().keys({
    phone: Joi.string().min(10).max(10).required().error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.min":
            err.message = `${err.local.key} should have at least ${err.local.limit} digit!`;
            break;
          case "string.max":
            err.message = `${err.local.key} should have at most ${err.local.limit} digit!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  })
}

const verifyPhoneOtp = {
  body: Joi.object().keys({
    phone: Joi.string().min(10).max(10).required().error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.min":
            err.message = `${err.local.key} should have at least ${err.local.limit} digit!`;
            break;
          case "string.max":
            err.message = `${err.local.key} should have at most ${err.local.limit} digit!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
    phone_otp: Joi.string().min(5).max(6).required().error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.min":
            err.message = `${err.local.key} should have at least ${err.local.limit} digit!`;
            break;
          case "string.max":
            err.message = `${err.local.key} should have at most ${err.local.limit} digit!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
    userId: Joi.required().custom(objectId).error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = `${err.local.key} should not be empty!`;
            break;
          default:
            break;
        }
      });
      return errors;
    })
  })
}

const bankDetails = {
  body: Joi.object().keys({
    account_number: Joi.string().min(6).required().error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.min":
            err.message = `${err.local.key} should have at least ${err.local.limit} digit!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
    ifsc_code: Joi.string().min(5).required().error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.min":
            err.message = `${err.local.key} should have at least ${err.local.limit} digit!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  })
}

const signup = {
  body: Joi.object().keys({
    phone: Joi.string().min(10).max(10).required().error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.min":
            err.message = `${err.local.key} should have at least ${err.local.limit} digit!`;
            break;
          case "string.max":
            err.message = `${err.local.key} should have at most ${err.local.limit} digit!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
    email: Joi.string().email().max(256).required().error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.max":
            err.message = `${err.local.key} should have at least ${err.local.limit} digit!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
    password: Joi.required().custom(password).error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = `${err.local.key} should not be empty!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
    userId: Joi.required().custom(objectId).error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = `${err.local.key} should not be empty!`;
            break;
          default:
            break;
        }
      });
      return errors;
    })
  })
}

const login = {
  body: Joi.object().keys({
    identity: Joi.string().min(5).required().error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.min":
            err.message = `${err.local.key} should have at least ${err.local.limit} digit!`;
            break;
          case "string.max":
            err.message = `${err.local.key} should have at most ${err.local.limit} digit!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
    password: Joi.required().custom(password).error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "any.empty":
            err.message = `${err.local.key} should not be empty!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  })
}

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
}

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
}

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required()
  })
}

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required()
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password)
  })
}

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required()
  })
}

module.exports = {
  sendPhoneOtp,
  verifyPhoneOtp,
  bankDetails,
  signup,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
}
