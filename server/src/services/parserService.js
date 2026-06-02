/**
 * ️ Парсер для new.zvukofon.com
 * Научно-исследовательский проект (образовательные цели)
 * 
 * ⚠️ РЕЖИМ: Возврат данных БЕЗ сохранения в БД (для мгновенного отображения)
 */
const axios = require('axios');
const cheerio = require('cheerio');
// const prisma = require('../config/db'); // Prisma не используется в этом режиме

const BASE_URL = 'https://new.zvukofon.com';

const normalizeUrl = (rawUrl) => {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`;
  }
  return `${BASE_URL}/${url}`;
};

const parseCoverFromStyle = (style = '') => {
  const match = style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
  if (!match) return null;
  return normalizeUrl(match[2].trim());
};

/**
 * Парсит страницу и возвращает массив треков
 */
exports.parse = async (query) => {
  console.log('🔍 Parsing query:', query);
  try {
    const searchUrl = buildSearchUrl(query);

    const directResult = await parseZvukofon(searchUrl);
    if (directResult?.success && Array.isArray(directResult.tracks) && directResult.tracks.length > 0) {
      return directResult.tracks;
    }

    const response = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
      }
    });
    
    const $ = cheerio.load(response.data);
    const tracks = [];
    const seenUrls = new Set(); // Чтобы не дублировать треки

    $('a[href*=".mp3"], button[data-url]').each((i, el) => {
      const $el = $(el);
      const rawUrl = $el.attr('href') || $el.attr('data-url');
      const fullUrl = normalizeUrl(rawUrl);
      if (!fullUrl || seenUrls.has(fullUrl)) return;
      seenUrls.add(fullUrl);

      const $track = $el.closest('li, .track-item, .music-item, .topcharts__item, .chart__item, .track-detail, .albums__item, div');
      let title = '';
      let artist = 'Unknown';
      let coverUrl = null;

      const musmetaRaw = $track.attr('data-musmeta') || $el.attr('data-musmeta');
      if (musmetaRaw) {
        try {
          const musmetaJson = musmetaRaw
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          const meta = JSON.parse(musmetaJson);
          title = meta.title?.trim() || '';
          artist = meta.artist?.trim() || artist;
          coverUrl = normalizeUrl(meta.img);
        } catch (err) {
          console.warn('Failed to parse data-musmeta:', err.message);
        }
      }

      if (!title) {
        title = $track.find('h1, .track-title').first().text().trim();
      }
      if (!artist || artist === 'Unknown') {
        const artistText = $track.find('.track-artist, .artist-name').first().text().trim();
        if (artistText) artist = artistText;
      }

      if (!coverUrl) {
        const coverElement = $track.find('div.track-detail__img img, div.track-detail__img').first();
        if (coverElement.length) {
          coverUrl = normalizeUrl(coverElement.attr('src') || coverElement.attr('data-src') || parseCoverFromStyle(coverElement.attr('style') || ''));
        }
      }
      if (!coverUrl) {
        const fallbackCover = $track.find('div.topcharts__item-img, div.track-cover-img, div.albums__item-img, img.track-cover, img.album-cover').first();
        if (fallbackCover.length) {
          coverUrl = normalizeUrl(fallbackCover.attr('src') || fallbackCover.attr('data-src') || parseCoverFromStyle(fallbackCover.attr('style') || ''));
        }
      }
      if (!coverUrl) {
        const styleCover = $track.find('[style*="background-image"]').first();
        if (styleCover.length) {
          coverUrl = normalizeUrl(parseCoverFromStyle(styleCover.attr('style') || ''));
        }
      }

      if (!title) {
        const urlParts = fullUrl.split('/');
        const filename = decodeURIComponent(urlParts[urlParts.length - 1] || '');
        title = filename
          .replace('.mp3', '')
          .replace(/\(.*?\)/g, '')
          .replace(/\[.*?\]/g, '')
          .replace(/musportal\.org/i, '')
          .replace(/zvukofon/i, '')
          .replace(/_/g, ' ')
          .trim();
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          artist = parts[0].trim() || artist;
          title = parts.slice(1).join(' - ').trim();
        }
      }

      if (!title || title.length < 3) {
        title = $el.text().trim() || query || `Track ${i + 1}`;
      }

      tracks.push({
        id: `track_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
        title: title.slice(0, 100),
        artist: artist.slice(0, 100),
        url: fullUrl,
        coverUrl,
        duration: 0
      });
    });
    
    console.log(`✅ Found ${tracks.length} unique tracks`);
    if (tracks.length > 0) {
      console.log('🎵 First track:', JSON.stringify(tracks[0], null, 2));
    }
    
    return tracks;
    
  } catch (err) {
    console.error('❌ Parser error:', err.response?.status || err.message);
    return [];
  }
};
async function parseZvukofon(url) {
  try {
    console.log(`🌐 Загрузка: ${url}`);
    
    const { data } = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DungemusicResearchBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      }
    });

    const $ = cheerio.load(data);
    const tracks = [];

    // Селекторы для треков
    $('li.topcharts__item, li.chart__item, .track-item').each((_, el) => {
      try {
        const $el = $(el);
        const musmetaRaw = $el.attr('data-musmeta');
        
        if (musmetaRaw) {
          // Декодируем HTML-сущности
          const musmetaJson = musmetaRaw
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

          const meta = JSON.parse(musmetaJson);
          
          const title = meta.title?.trim();
          const artist = meta.artist?.trim() || 'Unknown';
          const rawUrl = meta.url;
          const rawCover = meta.img;
          const trackId = meta.id;

          if (!title || !rawUrl) return;

          const audioUrl = rawUrl.startsWith('http') 
            ? rawUrl 
            : `${BASE_URL}${rawUrl}`;
          
          const coverUrl = rawCover 
            ? (rawCover.startsWith('http') ? rawCover : `${BASE_URL}${rawCover}`)
            : null;

          const durationText = $el.find('.topcharts__item-info-time_total, .track-duration').text().trim();
          const duration = parseDuration(durationText);

          // Уникальный ID для React (key)
          const sourceId = trackId || Buffer.from(audioUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);

          tracks.push({
            id: String(sourceId), // 👈 ID для React key
            title,
            artist,
            url: audioUrl,
            coverUrl,
            duration,
            sourceId: String(sourceId),
          });
          
        } else {
          // Фоллбэк, если data-musmeta нет
          const title = $el.find('.topcharts__item-title-track, .track-title').text().trim();
          if (!title) return;
          
          const artist = $el.find('.topcharts__item-title-artist, .track-artist').text().trim() || 'Unknown';
          const rawUrl = $el.find('a[href*="/dl/"]').attr('href');
          
          if (!rawUrl) return;

          const audioUrl = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl}`;
          const sourceId = Buffer.from(audioUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);

          tracks.push({
            id: String(sourceId),
            title,
            artist,
            url: audioUrl,
            coverUrl: null,
            duration: null,
            sourceId: String(sourceId),
          });
        }
      } catch (err) {
        console.warn(`⚠️ Пропущен трек: ${err.message}`);
      }
    });

    if (tracks.length === 0) {
      throw new Error('Треки не найдены. Проверьте URL или селекторы.');
    }

    // 🚀 ВОЗВРАЩАЕМ ТРЕКИ СРАЗУ (БЕЗ ЗАПИСИ В БД)
    return { 
      success: true, 
      count: tracks.length, 
      tracks 
    };

  } catch (error) {
    console.error('🕷️ Parser error:', error);
    throw new Error(`Ошибка парсинга: ${error.message}`);
  }
}

/**
 * Парсит длительность "MM:SS" -> секунды
 */
function parseDuration(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split(':').map(s => parseInt(s, 10));
  if (parts.length !== 2 || parts.some(isNaN)) return null;
  return parts[0] * 60 + parts[1];
}

/**
 * Формирует поисковый URL
 */
function buildSearchUrl(query) {
  const encoded = encodeURIComponent(query.trim().toLowerCase());
  return `${BASE_URL}/music/${encoded}`;
}

module.exports = { 
  parse: exports.parse,  // ← явно указываем, что берём из exports
  parseZvukofon, 
  buildSearchUrl 
};