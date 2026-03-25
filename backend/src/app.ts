import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import apiRoutes from './routes';
import db from './database/database';
import rateLimit from 'express-rate-limit';
import LeaderboardService from './services/Leaderboard.service';
import PKWebSocketService from './services/PKWebSocket.service';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 限流：防止滥用
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api', limiter);

// API路由
app.use('/api', apiRoutes);

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
  app.get('*', (req, res) => {
    res.sendFile('../frontend/dist/index.html', { root: '.' });
  });
}

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('全局错误:', err);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

// 初始化数据库
async function initialize() {
  try {
    await db.initialize();

    // 启动排行榜定时任务
    LeaderboardService.startScheduledTasks();

    // 初始化PK WebSocket服务
    PKWebSocketService.initialize(server);

    server.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📚 API文档: http://localhost:${PORT}/api`);
      console.log(`🎮 PK对战: ws://localhost:${PORT}/ws/pk`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

initialize();

export default app;
