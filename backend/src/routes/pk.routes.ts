import express, { Request, Response } from 'express';
import PKWebSocketService from '../services/PKWebSocket.service';
import UserModel from '../models/User.model';

const router = express.Router();

/**
 * GET /api/pk/status
 * 获取PK服务状态
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'active',
    message: 'PK对战服务运行中',
    websocketPath: '/ws/pk'
  });
});

/**
 * POST /api/pk/create-room
 * 创建好友对战房间
 *
 * Body:
 * - userId: 房主用户ID
 * - difficulty: 难度 (easy, medium, hard)
 */
router.post('/create-room', async (req: Request, res: Response) => {
  try {
    const { userId, difficulty = 'medium' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: '无效的难度级别' });
    }

    const roomId = PKWebSocketService.createFriendRoom(userId, user.username, difficulty);

    res.json({
      message: '房间创建成功',
      roomId,
      websocketUrl: `/ws/pk`
    });
  } catch (error) {
    console.error('创建房间失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/pk/room/:roomId
 * 获取房间信息
 */
router.get('/room/:roomId', (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const room = PKWebSocketService.getRoom(roomId);

    if (!room) {
      return res.status(404).json({ error: '房间不存在' });
    }

    res.json({
      roomId: room.roomId,
      status: room.status,
      players: room.players.map(p => ({
        userId: p.userId,
        username: p.username,
        isReady: p.isReady
      })),
      config: {
        totalQuestions: room.config.totalQuestions,
        timePerQuestion: room.config.timePerQuestion,
        difficulty: room.config.difficulty
      },
      createdAt: room.createdAt
    });
  } catch (error) {
    console.error('获取房间信息失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/pk/user/:userId/room
 * 获取用户当前房间
 */
router.get('/user/:userId/room', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const room = PKWebSocketService.getUserRoom(userId);

    if (!room) {
      return res.json({ inRoom: false });
    }

    res.json({
      inRoom: true,
      roomId: room.roomId,
      status: room.status,
      players: room.players.map(p => ({
        userId: p.userId,
        username: p.username,
        score: p.score,
        correctCount: p.correctCount
      }))
    });
  } catch (error) {
    console.error('获取用户房间失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * POST /api/pk/quick-match
 * 快速匹配（返回WebSocket连接信息）
 *
 * Body:
 * - userId: 用户ID
 * - difficulty: 难度
 */
router.post('/quick-match', async (req: Request, res: Response) => {
  try {
    const { userId, difficulty = 'medium' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: '无效的难度级别' });
    }

    res.json({
      message: '请通过WebSocket连接进行匹配',
      websocketUrl: `/ws/pk`,
      instructions: {
        step1: '建立WebSocket连接',
        step2: '发送 match_request 消息',
        step3: '等待 match_found 响应'
      },
      sampleMessage: {
        type: 'match_request',
        payload: {
          userId,
          username: user.username,
          difficulty,
          websocketId: '<generated_on_connect>'
        }
      }
    });
  } catch (error) {
    console.error('快速匹配失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/pk/config
 * 获取PK配置
 */
router.get('/config', (req: Request, res: Response) => {
  res.json({
    difficulties: {
      easy: {
        totalQuestions: 10,
        timePerQuestion: 20,
        pointsMultiplier: 1,
        description: '适合初学者'
      },
      medium: {
        totalQuestions: 10,
        timePerQuestion: 15,
        pointsMultiplier: 1.5,
        description: '标准难度'
      },
      hard: {
        totalQuestions: 15,
        timePerQuestion: 12,
        pointsMultiplier: 2,
        description: '高手挑战'
      }
    },
    scoring: {
      correctAnswer: 100,
      timeBonus: '剩余时间/100',
      pkWinBonus: 50
    },
    rules: {
      matchTimeout: 30000,
      reconnectTimeout: 10000
    }
  });
});

export default router;