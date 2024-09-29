const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/auth.config');

class TokenController {
  signToken(payload) {
    try {
      return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: '1h',
        algorithm: 'HS256'
      });
    } catch (error) {
      console.error('Token signing error:', error);
      const err = new Error('Error creating token');
      err.status = 500;
      throw err;
    }
  }

  verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error('No token provided');
      error.status = 401;
      return next(error);
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      const error = new Error('Invalid token format');
      error.status = 401;
      return next(error);
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.secret, { algorithms: ['HS256'] });
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        error.status = 401;
        error.message = 'Token expired';
      } else if (error.name === 'JsonWebTokenError') {
        error.status = 403;
        error.message = 'Invalid token';
      } else {
        error.status = 500;
        error.message = 'Internal server error';
      }
      next(error);
    }
  }
}

module.exports = new TokenController();