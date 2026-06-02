/**
 * 🎵 Dungemusic API Server
 * Научно-исследовательский проект
 * Бэкенд: Node.js + Express + Prisma + PostgreSQL
 */
process.setMaxListeners(20); // Увеличиваем лимит слушателей
// 🔧 Загрузка переменных окружения (.env)
require('dotenv').config();

// 📦 Импорт библиотек
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

// 📁 Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
// const trackRoutes = require('./routes/trackRoutes'); // Будет позже

// ⚙️ Инициализация
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 🌐 Настройка CORS (разрешаем запросы с фронтенда)
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
  credentials: true, // Разрешаем cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// 🛡️ Middleware (обработчики запросов)
app.use(helmet()); // Защита заголовков
app.use(cors(corsOptions)); // CORS
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); // Логирование
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг form-data
app.use(cookieParser()); // Работа с cookies

// 🩺 Health check endpoint (проверка работоспособности)
app.get('/api/health', async (req, res) => {
  try {
    // Проверяем подключение к БД
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      service: 'dungemusic-api',
      environment: NODE_ENV,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      service: 'dungemusic-api',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// 📚 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);  // ← Проверь путь!
app.use('/api/playlists', playlistRoutes);
// app.use('/api/tracks', trackRoutes); // Раскомментируй, когда создашь

// 🏠 Главная страница API (документация)
app.get('/api', (req, res) => {
  res.json({
    name: 'Dungemusic API',
    version: '1.0.0',
    description: 'Music web application backend for research project',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
      },
      // tracks: {
      //   list: 'GET /api/tracks',
      //   detail: 'GET /api/tracks/:id',
      // },
    },
    documentation: 'https://github.com/yourusername/dungemusic',
  });
});

// ❌ Обработчик 404 (маршрут не найден)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Маршрут ${req.method} ${req.originalUrl} не существует`,
    timestamp: new Date().toISOString(),
  });
});

// ❌ Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err);
  
  // Prisma ошибки
  if (err.code?.startsWith('P')) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'Ошибка базы данных',
      code: err.code,
    });
  }
  
  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Неверный или просроченный токен',
    });
  }
  
  // Остальные ошибки
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'Что-то пошло не так',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 🚀 Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  🎵 Dungemusic API Server          ║
╠════════════════════════════════════╣
║  🌐 URL: http://localhost:${PORT}          
║  📦 Environment: ${NODE_ENV}                  
║  🗄️  Database: PostgreSQL (Prisma)    
║  🔗 Client: ${corsOptions.origin}
╚════════════════════════════════════╝
  `.trim());
});

// 🛑 Корректное завершение работы
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал SIGINT, завершаем работу...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал SIGTERM, завершаем работу...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

// 🧪 Экспорт для тестов
module.exports = { app, prisma };