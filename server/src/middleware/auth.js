/**
 * 🔐 Middleware для проверки авторизации
 * Проверяет JWT-токен из cookies или заголовка
 */
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const authHeaderToken = req.headers.authorization?.split(' ')[1];
    const xToken = req.headers['x-access-token'];
    const cookieToken = req.cookies?.token || req.cookies?.accessToken || req.cookies?.authToken;
    const token = authHeaderToken || xToken || cookieToken;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('Missing JWT_SECRET env var');
      return res.status(500).json({ error: 'Server Error', message: 'JWT secret not configured' });
    }

    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};