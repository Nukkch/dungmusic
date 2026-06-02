const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');

// Получить список треков (пагинация + поиск)
router.get('/', trackController.getTracks);

// Запустить парсер (в продакшене лучше защитить middleware auth)
router.post('/parse', trackController.runParser);

module.exports = router;