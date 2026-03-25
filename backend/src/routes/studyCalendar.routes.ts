import express from 'express';
import dailyChallengeController from '../controllers/DailyChallengeController';

const router = express.Router();

/**
 * 学习日历和签到路由
 * Base: /api
 */

// 获取用户学习日历
router.get('/study-calendar', dailyChallengeController.getStudyCalendar.bind(dailyChallengeController));

// 今日签到
router.post('/check-in', dailyChallengeController.checkIn.bind(dailyChallengeController));

export default router;
