import express from 'express';
import ScoreModel, { Score } from '../models/Score.model';

const router = express.Router();

// 提交成绩
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      difficulty,
      operation_type,
      total_questions,
      correct_count,
      score,
      time_spent
    } = req.body;

    // 验证输入
    if (!user_id || !difficulty || !operation_type || !total_questions || !correct_count || !score || !time_spent) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    // 验证难度和运算类型
    const validDifficulties = ['easy', 'medium', 'hard'];
    const validOperations = ['addition', 'subtraction', 'multiplication', 'division'];

    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: '无效的难度级别' });
    }

    if (!validOperations.includes(operation_type)) {
      return res.status(400).json({ error: '无效的运算类型' });
    }

    const scoreId = await ScoreModel.create({
      user_id,
      difficulty,
      operation_type,
      total_questions,
      correct_count,
      score,
      time_spent
    });

    res.status(201).json({
      message: '成绩提交成功',
      scoreId
    });
  } catch (error) {
    console.error('提交成绩失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取用户历史成绩
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 50;

    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const scores = await ScoreModel.findByUserId(userId, limit);

    res.json({ scores });
  } catch (error) {
    console.error('获取成绩失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取成绩摘要
router.get('/user/:userId/summary', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const summary = await ScoreModel.getSummaryByUserId(userId);

    // 计算正确率
    const accuracy = summary.total_questions > 0
      ? Math.round((summary.total_correct / summary.total_questions) * 100)
      : 0;

    res.json({
      totalSessions: summary.total_sessions,
      totalQuestions: summary.total_questions,
      totalCorrect: summary.total_correct,
      accuracy: `${accuracy}%`,
      averageScore: Math.round(summary.avg_score || 0),
      bestScore: summary.max_score || 0,
      difficultyBreakdown: {
        easy: summary.easy_count || 0,
        medium: summary.medium_count || 0,
        hard: summary.hard_count || 0
      }
    });
  } catch (error) {
    console.error('获取成绩摘要失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取最近成绩
router.get('/user/:userId/recent', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 10;

    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const recentScores = await ScoreModel.getRecentScores(userId, limit);

    res.json({ recentScores });
  } catch (error) {
    console.error('获取最近成绩失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
