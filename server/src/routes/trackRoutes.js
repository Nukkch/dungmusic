const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');

router.get('/', trackController.getTracks);
router.post('/parse', trackController.runParser);

module.exports = router;