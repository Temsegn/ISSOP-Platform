const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma duplicate key error
  if (err.code === 'P2002') {
    statusCode = 400;
    message = `Duplicate field value entered: ${err.meta?.target?.join(', ')}`;
  }
  
  // Handle Prisma record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Ensure robust formatting
  const response = {
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
