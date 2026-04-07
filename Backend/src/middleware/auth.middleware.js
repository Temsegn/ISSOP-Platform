const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Not authorized, no token',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Not authorized, user not found',
      });
    }

    if (user.isDeleted) {
       return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Not authorized, user is deleted',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Not authorized, invalid token',
    });
  }
};

module.exports = authMiddleware;
