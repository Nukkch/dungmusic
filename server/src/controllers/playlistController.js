const prisma = require('../config/db');

// 📥 Получить плейлисты пользователя
exports.getPlaylists = async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: 'DB Error', message: err.message });
  }
};

//  Создать плейлист
exports.createPlaylist = async (req, res) => {
  try {
    const userId = req.userId;  // ← Это должно быть!
    const { name } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: 'Name required' });

    const playlist = await prisma.playlist.create({
      data: { name: name.trim(), userId, tracks: [] }
    });
    res.status(201).json(playlist);
  } catch (err) {
    console.error('🔥 Create playlist error:', err);
    res.status(500).json({ error: 'DB Error', message: err.message });
  }
};

// 🗑️ Удалить плейлист
exports.deletePlaylist = async (req, res) => {
  try {
    await prisma.playlist.delete({
      where: { id: parseInt(req.params.id), userId: req.userId }
    });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'DB Error', message: err.message });
  }
};

// 🎵 Добавить трек в плейлист (принимает ПОЛНЫЙ объект трека)
exports.addTrack = async (req, res) => {
  try {
    console.log('🎵 Add track request:', {
      playlistId: req.params.id,
      userId: req.userId,
      track: req.body
    });

    const { id } = req.params;
    const track = req.body;

    // Проверка входных данных
    if (!track) {
      return res.status(400).json({ error: 'Track data required' });
    }

    const playlist = await prisma.playlist.findUnique({ 
      where: { id: parseInt(id) } 
    });

    console.log('📋 Found playlist:', playlist);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Получаем текущие треки (или пустой массив)
    const currentTracks = playlist.tracks || [];
    console.log('Current tracks:', currentTracks);

    // Проверка дубликатов
    const exists = currentTracks.some(t => 
      t.id === track.id || 
      (t.sourceId && t.sourceId === track.sourceId)
    );
    
    if (exists) {
      return res.status(409).json({ error: 'Track already in playlist' });
    }

    // Обновляем плейлист
    const updatedTracks = [...currentTracks, track];
    console.log('Adding track:', track);

    const updated = await prisma.playlist.update({
      where: { id: parseInt(id) },
      data: { tracks: updatedTracks }
    });

    console.log('✅ Track added successfully');
    res.json(updated);
    
  } catch (err) {
    console.error('🔥 Add track error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Database Error', 
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

//  Удалить трек из плейлиста
// Удалить трек из плейлиста
exports.removeTrack = async (req, res) => {
  try {
    const { id, trackId } = req.params; // id = playlistId, trackId = track.id
    const playlist = await prisma.playlist.findUnique({ where: { id: parseInt(id) } });

    if (!playlist || playlist.userId !== req.userId) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Фильтруем треки, удаляя нужный (по id или sourceId)
    const currentTracks = playlist.tracks || [];
    const updatedTracks = currentTracks.filter(t => 
      t.id !== trackId && t.sourceId !== trackId
    );

    const updated = await prisma.playlist.update({
      where: { id: parseInt(id) },
      data: { tracks: updatedTracks }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'DB Error', message: err.message });
  }
};