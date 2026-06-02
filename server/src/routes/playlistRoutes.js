const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const authMiddleware = require('../middleware/auth');

// Все маршруты требуют авторизации
router.use(authMiddleware);

router.get('/', playlistController.getPlaylists);
router.post('/', playlistController.createPlaylist);
router.delete('/:id', playlistController.deletePlaylist);
router.post('/:id/tracks', playlistController.addTrack);
router.delete('/:id/tracks/:trackId', playlistController.removeTrack);

module.exports = router;