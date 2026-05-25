const { body, check, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper to format validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return first error message as 'msg' for frontend compatibility
    return res.status(400).json({ 
      errors: errors.array(), 
      msg: errors.array()[0].msg 
    });
  }
  next();
};

exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Please enter a password with 6 or more characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('role')
    .isIn(['customer', 'retailer'])
    .withMessage('Role must be either customer or retailer'),
  handleValidationErrors
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

exports.validateLocation = [
  body('userId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid User ID format');
      }
      return true;
    }),
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid coordinate between -90 and 90'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid coordinate between -180 and 180'),
  handleValidationErrors
];
