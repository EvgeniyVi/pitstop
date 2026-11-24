// app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

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

// Позже добавишь сюда:
// import authRoutes from './routes/authRoutes.js';
// app.use('/api/auth', authRoutes);

// 3. 404 для несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// 4. Единый обработчик ошибок
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

export default app;