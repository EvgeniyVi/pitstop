// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { sequelize } from './db.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// 1. Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// 2. Роуты
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// 4. Единый обработчик ошибок (в самом конце, 4 аргумента)
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Ошибка валидации данных',
      details: err.errors?.map((e) => e.message),
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? 'Внутренняя ошибка сервера' : err.message,
  });
});

// 5. Запуск: сначала проверяем БД, потом открываем порт
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();