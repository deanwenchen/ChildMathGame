import express from 'express';
import userRoutes from './user.routes';
import scoreRoutes from './score.routes';
import questionRoutes from './question.routes';

const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '算术学习工具API运行正常' });
});

// 基础路由
router.get('/', (req, res) => {
  res.json({
    message: '欢迎使用儿童算术学习工具API',
    version: '1.0.0',
    endpoints: {
      users: 'GET/POST /api/users',
      scores: 'GET/POST /api/scores',
      questions: 'GET /api/questions',
      health: 'GET /api/health'
    }
  });
});

// 路由分组
router.use('/users', userRoutes);
router.use('/scores', scoreRoutes);
router.use('/questions', questionRoutes);

export default router;
