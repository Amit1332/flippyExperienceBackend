module.exports = {
  USER_ROLES: {
    SUPPLIER: 'supplier',
    ADMIN: 'admin',
    USER: 'user'
  },
  SIGNUP_PROGRESS: {
    PHONE_VERIFIED_EMAIL_PENDING: {
      isPhone: 1,
      isEmail: 0
    }, 
    PHONE_PENDING_EMAIL_PENDING: {
      isPhone: 0,
      isEmail: 0
    },
    PHONE_VERIFIED_EMAIL_VERIFIED: {
      isPhone: 1,
      isEmail: 1
    },
  },
  CHEQUE_IMAGE_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  KEYS_TO_REMOVE_SUPPLIER_RESPONSE: ['password','email_otp', 'phone_otp', 'phone_otp_expiry','email_otp_expiry', 'bank_details'],
  PAN_IMAGE_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
}
