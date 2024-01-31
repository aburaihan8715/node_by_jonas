/* eslint-disable prefer-const */
const AppError = require('../utils/appError');

// HANDLE CAST ERROR DB
const handleCastErrorDB = (err, res) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// HANDLE DUPLICATE KEY FIELD
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

// HANDLE VALIDATION ERROR
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// HANDLE JWT ERROR
const handleJWTError = () =>
  new AppError(`Invalid token. Please log in again!`, 401);

// HANDLE JWT ERROR
const handleJWTExpiredError = () =>
  new AppError(`Your token has expired. Please log in again!`, 401);

// SEND ERROR DEV
const sendErrorDev = (err, res) => {
  // console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message || 'Something went wrong!',
    stack: err.stack,
  });
};

// SEND ERROR PROD
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  // console.log('========check isOperational==========', err.isOperational);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // console.log('========Dev==========', err);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log('========Prod==========', err);
    // FIXME: not working
    // let error = { ...err };
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    sendErrorProd(err, res);
  }
};
