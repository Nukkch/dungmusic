/**
 * 🔐 Middleware для проверки авторизации
 * Проверяет JWT-токен из cookies или заголовка
 */
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;  // ← Обязательно!
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};