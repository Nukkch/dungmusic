/**
 * 🛣️ Маршруты авторизации
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Регистрация нового пользователя
router.post('/register', authController.register);

// Вход в систему
router.post('/login', authController.login);

// Выход из системы
router.post('/logout', authController.logout);

module.exports = router;