const { body, param, query, validationResult } = require('express-validator');
const { asyncHandler } = require('./errorHandler');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Video validation rules
const validateVideo = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description must be less than 5000 characters'),
  body('channelId')
    .trim()
    .notEmpty().withMessage('Channel ID is required')
    .isLength({ min: 1, max: 100 }).withMessage('Channel ID must be between 1 and 100 characters'),
  body('channelName')
    .trim()
    .notEmpty().withMessage('Channel name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Channel name must be between 1 and 100 characters'),
  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('Duration must be a non-negative integer'),
  body('videoUrl')
    .optional()
    .trim()
    .isURL().withMessage('Video URL must be a valid URL'),
  body('thumbnail')
    .optional()
    .trim()
    .isURL().withMessage('Thumbnail must be a valid URL'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 20) {
        throw new Error('Maximum 20 tags allowed');
      }
      return true;
    }),
  handleValidationErrors
];

// Comment validation rules
const validateComment = [
  body('videoId')
    .trim()
    .notEmpty().withMessage('Video ID is required'),
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ min: 1, max: 10000 }).withMessage('Comment must be between 1 and 10000 characters'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required')
    .isLength({ min: 1, max: 100 }).withMessage('Author name must be between 1 and 100 characters'),
  body('avatar')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Avatar URL must be less than 500 characters'),
  handleValidationErrors
];

// Reply validation rules
const validateReply = [
  body('text')
    .trim()
    .notEmpty().withMessage('Reply text is required')
    .isLength({ min: 1, max: 5000 }).withMessage('Reply must be between 1 and 5000 characters'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required')
    .isLength({ min: 1, max: 100 }).withMessage('Author name must be between 1 and 100 characters'),
  handleValidationErrors
];

// Channel validation rules
const validateChannel = [
  body('name')
    .trim()
    .notEmpty().withMessage('Channel name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Channel name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  handleValidationErrors
];

// User registration validation
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Playlist validation
const validatePlaylist = [
  body('name')
    .trim()
    .notEmpty().withMessage('Playlist name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Playlist name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('userId')
    .trim()
    .notEmpty().withMessage('User ID is required'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .trim(),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 1, max: 200 }).withMessage('Search query must be between 1 and 200 characters'),
  query('type')
    .optional()
    .isIn(['all', 'videos', 'channels', 'playlists']).withMessage('Type must be one of: all, videos, channels, playlists'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateVideo,
  validateComment,
  validateReply,
  validateChannel,
  validateRegister,
  validateLogin,
  validatePlaylist,
  validateId,
  validatePagination,
  validateSearch,
  handleValidationErrors,
  asyncHandler
};

