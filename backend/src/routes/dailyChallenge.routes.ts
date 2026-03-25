import express from 'express';
import dailyChallengeController from '../controllers/DailyChallengeController';

const router = express.Router();

/**
 * 每日挑战路由
 * Base: /api/daily-challenge
 */

// 获取指定日期的挑战题目
router.get('/:date', dailyChallengeController.getDailyChallenge.bind(dailyChallengeController));

// 提交每日挑战答案
router.post('/:date/submit', dailyChallengeController.submitDailyChallenge.bind(dailyChallengeController));

export default router;
