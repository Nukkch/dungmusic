const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
console.log('🔍 Prisma loaded:', typeof prisma);
console.log('🔍 Prisma.user:', typeof prisma.user);

// 📝 Регистрация
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Bad Request', message: 'Username and password required' });
    }

    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Conflict', message: 'Username already exists' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword
      }
    });

    // Генерация токена
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user.id.toString(),
        username: user.username
      },
      accessToken: token
    });
  } catch (err) {
    console.error('🔥 Register error:', err);
    res.status(500).json({ error: 'Database Error', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Bad Request', message: 'Username and password required' });
    }

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    }

    // Генерация токена
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id.toString(),
        username: user.username
      },
      accessToken: token
    });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ error: 'Database Error', message: err.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};

