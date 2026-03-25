import express, { Request, Response } from 'express';
import LeaderboardService from '../services/Leaderboard.service';
import LeaderboardModel, { LeaderboardType } from '../models/Leaderboard.model';
import UserModel from '../models/User.model';

const router = express.Router();

/**
 * 排行榜类型验证中间件
 */
const validateLeaderboardType = (req: Request, res: Response, next: express.NextFunction): void => {
  const type = req.query.type as string || req.params.type as string;
  const validTypes: LeaderboardType[] = ['weekly', 'monthly', 'all_time'];

  if (type && !validTypes.includes(type as LeaderboardType)) {
    res.status(400).json({
      error: '无效的排行榜类型',
      validTypes
    });
    return;
  }

  next();
};

/**
 * GET /api/leaderboard
 * 获取排行榜列表
 *
 * Query params:
 * - type: 排行榜类型 (weekly, monthly, all_time) 默认 weekly
 * - limit: 返回数量 默认 50
 * - offset: 偏移量 默认 0
 */
router.get('/', validateLeaderboardType, async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as LeaderboardType) || 'weekly';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    let entries;
    switch (type) {
      case 'monthly':
        entries = await LeaderboardService.getMonthlyLeaderboard(limit, offset);
        break;
      case 'all_time':
        entries = await LeaderboardService.getAllTimeLeaderboard(limit, offset);
        break;
      case 'weekly':
      default:
        entries = await LeaderboardService.getWeeklyLeaderboard(limit, offset);
    }

    res.json({
      type,
      entries,
      pagination: {
        limit,
        offset,
        hasMore: entries.length === limit
      }
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/leaderboard/top
 * 获取排行榜前N名
 *
 * Query params:
 * - type: 排行榜类型 (weekly, monthly, all_time) 默认 weekly
 * - count: 返回数量 默认 10
 */
router.get('/top', validateLeaderboardType, async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as LeaderboardType) || 'weekly';
    const count = Math.min(parseInt(req.query.count as string) || 10, 20);

    const entries = await LeaderboardService.getTopUsers(type, count);

    res.json({
      type,
      entries
    });
  } catch (error) {
    console.error('获取排行榜前N名失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/leaderboard/user/:userId
 * 获取用户排名信息
 *
 * Params:
 * - userId: 用户ID
 *
 * Query params:
 * - type: 排行榜类型 (weekly, monthly, all_time) 默认 all_time
 */
router.get('/user/:userId', validateLeaderboardType, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const type = (req.query.type as LeaderboardType) || 'all_time';

    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const result = await LeaderboardService.getUserRank(userId, type);

    if (!result.entry) {
      return res.status(404).json({ error: '用户未在排行榜中' });
    }

    // 获取用户周围的排名
    const surrounding = await LeaderboardService.getUserSurroundingRankings(userId, type, 2);

    res.json({
      rank: result.rank,
      entry: result.entry,
      surrounding
    });
  } catch (error) {
    console.error('获取用户排名失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/leaderboard/user/:userId/level
 * 获取用户积分等级信息
 */
router.get('/user/:userId/level', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const levelInfo = await LeaderboardService.getUserPointsLevel(userId);

    if (!levelInfo) {
      return res.status(404).json({ error: '用户未在排行榜中' });
    }

    res.json(levelInfo);
  } catch (error) {
    console.error('获取用户积分等级失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * POST /api/leaderboard/user/:userId/points
 * 更新用户积分（内部接口）
 *
 * Body:
 * - points: 积分增量
 * - category: 积分类型 (correct, quick, combo, pk)
 */
router.post('/user/:userId/points', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { points, category = 'correct' } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    if (!points || typeof points !== 'number' || points <= 0) {
      return res.status(400).json({ error: '积分必须为正数' });
    }

    const validCategories = ['correct', 'quick', 'combo', 'pk'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: '无效的积分类型',
        validCategories
      });
    }

    // 获取用户信息
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    await LeaderboardService.updatePoints(userId, user.username, points, category);

    res.json({
      message: '积分更新成功',
      userId,
      pointsAdded: points,
      category
    });
  } catch (error) {
    console.error('更新积分失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * POST /api/leaderboard/answer
 * 处理答题事件
 *
 * Body:
 * - userId: 用户ID
 * - timeSpent: 答题时间（秒）
 * - isCorrect: 是否正确
 * - currentCombo: 当前连击数
 */
router.post('/answer', async (req: Request, res: Response) => {
  try {
    const { userId, timeSpent, isCorrect, currentCombo = 0 } = req.body;

    if (!userId || typeof timeSpent !== 'number' || typeof isCorrect !== 'boolean') {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    // 获取用户信息
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const result = await LeaderboardService.handleAnswerEvent(
      userId,
      user.username,
      timeSpent,
      isCorrect,
      currentCombo
    );

    res.json({
      points: result.points,
      breakdown: result.breakdown,
      newCombo: result.newCombo
    });
  } catch (error) {
    console.error('处理答题事件失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * POST /api/leaderboard/pk-win
 * 处理PK胜利事件
 *
 * Body:
 * - userId: 用户ID
 * - marginOfVictory: 胜利优势（答对题数差）
 */
router.post('/pk-win', async (req: Request, res: Response) => {
  try {
    const { userId, marginOfVictory = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' });
    }

    // 获取用户信息
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const result = await LeaderboardService.handlePKWin(userId, user.username, marginOfVictory);

    res.json({
      points: result.points,
      description: result.description
    });
  } catch (error) {
    console.error('处理PK胜利事件失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/leaderboard/friends
 * 获取好友排行榜
 *
 * Query params:
 * - userIds: 好友ID列表（逗号分隔）
 * - type: 排行榜类型 (weekly, monthly, all_time) 默认 weekly
 * - limit: 返回数量 默认 50
 */
router.get('/friends', validateLeaderboardType, async (req: Request, res: Response) => {
  try {
    const userIdsStr = req.query.userIds as string;
    const type = (req.query.type as LeaderboardType) || 'weekly';
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userIdsStr) {
      return res.status(400).json({ error: '缺少好友ID列表' });
    }

    const userIds = userIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (userIds.length === 0) {
      return res.status(400).json({ error: '无效的好友ID列表' });
    }

    const entries = await LeaderboardService.getFriendsLeaderboard(userIds, type, limit);

    res.json({
      type,
      entries
    });
  } catch (error) {
    console.error('获取好友排行榜失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * POST /api/leaderboard/admin/reset-weekly
 * 管理员接口：重置周榜
 */
router.post('/admin/reset-weekly', async (req: Request, res: Response) => {
  try {
    await LeaderboardService.resetWeeklyLeaderboard();
    res.json({ message: '周榜已重置' });
  } catch (error) {
    console.error('重置周榜失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * POST /api/leaderboard/admin/reset-monthly
 * 管理员接口：重置月榜
 */
router.post('/admin/reset-monthly', async (req: Request, res: Response) => {
  try {
    await LeaderboardService.resetMonthlyLeaderboard();
    res.json({ message: '月榜已重置' });
  } catch (error) {
    console.error('重置月榜失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * GET /api/leaderboard/stats/:userId
 * 获取用户统计信息
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const entry = await LeaderboardModel.findByUserId(userId);

    if (!entry) {
      return res.status(404).json({ error: '用户统计信息不存在' });
    }

    res.json({
      userId: entry.user_id,
      username: entry.username,
      totalPoints: entry.total_points,
      weeklyPoints: entry.weekly_points,
      monthlyPoints: entry.monthly_points,
      correctAnswers: entry.correct_answers,
      quickAnswers: entry.quick_answers,
      maxCombo: entry.max_combo,
      pkWins: entry.pk_wins,
      updatedAt: entry.updated_at
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;