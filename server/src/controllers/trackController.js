const { parseZvukofon, buildSearchUrl } = require('../services/parserService');
const prisma = require('../config/db');

/**
 * 🚀 Запуск парсера zvukofon.com
 * POST /api/tracks/parse
 * Body: { "url": "..." } или { "search": "sugarcrash" }
 */
const parserService = require('../services/parserService');

exports.parse = async (req, res) => {  // ← parse, не search!
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }
    
    const tracks = await parserService.parse(query);  // ← parse!
    res.json(tracks);
  } catch (err) {
    console.error('Parse error:', err);
    res.status(500).json({ error: 'Parse failed', message: err.message });
  }
};
exports.runParser = async (req, res) => {
  try {
    const { url, search } = req.body || {};
    
    let targetUrl;
    
    if (search) {
      // 🔍 Поиск: формируем URL вида /music/{query}
      targetUrl = buildSearchUrl(search);
      console.log(`🔍 Поиск: "${search}" → ${targetUrl}`);
    } else if (url) {
      // 🌐 Прямой URL
      targetUrl = url;
    } else {
      // 📊 По умолчанию: топ-чарт
      targetUrl = 'https://new.zvukofon.com/charts';
    }
    
    // Проверка домена (безопасность)
    if (!targetUrl.includes('zvukofon.com')) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Парсер поддерживает только zvukofon.com' 
      });
    }

    console.log(`🕷️ Запуск парсера: ${targetUrl}`);
    const result = await parseZvukofon(targetUrl);
    
    res.json({ 
        message: 'Парсинг завершён', 
        tracks: result.tracks, // 👈 Отправляем треки на фронтенд
        count: result.count,
        timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('🔥 Parser controller error:', err);
    res.status(500).json({ 
      error: 'Parser Error', 
      message: err.message 
    });
  }
};

/**
 * 📚 Получение треков с пагинацией и поиском ПО БАЗЕ
 * GET /api/tracks?page=1&limit=20&search=rock
 */
exports.getTracks = async (req, res) => {
  try {
    console.log('📥 GET /api/tracks запрос:', req.query);
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || '';

    console.log('🔍 Поиск:', search, '| Страница:', page);

    // 🔥 ИСПРАВЛЕНИЕ: Упрощенный поиск без mode
    const where = search.length > 0 ? {
      OR: [
        { title: { contains: search } },
        { artist: { contains: search } }
      ]
    } : {};

    console.log('💾 Prisma запрос:', JSON.stringify(where, null, 2));

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, 
          title: true, 
          artist: true, 
          url: true,
          coverUrl: true, 
          duration: true, 
          sourceId: true, 
          createdAt: true
        }
      }),
      prisma.track.count({ where })
    ]);

    console.log(`✅ Найдено ${tracks.length} треков из ${total}`);

    res.json({
      tracks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('🔥 Get tracks error:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
      error: 'Database Error', 
      message: err.message,
      code: err.code
    });
  }
};