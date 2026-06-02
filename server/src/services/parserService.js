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

/**
 * Парсит страницу и возвращает массив треков
 */
exports.parse = async (query) => {
  try {
    // Здесь твой код парсинга
    // Пример (замени на свой URL парсера):
    const response = await axios.get(`https://new.zvukofon.com/search`, {
      params: { text: query }
    });
    
    const $ = cheerio.load(response.data);
    const tracks = [];
    
    $('.track-item').each((i, el) => {
      tracks.push({
        id: i,
        title: $(el).find('.title').text().trim(),
        artist: $(el).find('.artist').text().trim(),
        url: $(el).find('audio source').attr('src'),
        coverUrl: $(el).find('img').attr('src'),
        duration: 0 // или распарси из HTML
      });
    });
    
    return tracks;
  } catch (err) {
    console.error('Parser error:', err.message);
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

module.exports = { parseZvukofon, buildSearchUrl };