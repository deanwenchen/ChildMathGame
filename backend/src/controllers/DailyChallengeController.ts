/**
 * 每日挑战控制器
 *
 * 处理每日挑战的生成、提交和学习日历查询
 */

import { Request, Response } from 'express';
import dailyTaskGenerator from '../utils/DailyTaskGenerator';
import db from '../database/database';

/**
 * 每日挑战提交记录接口
 */
interface DailyChallengeSubmission {
  id?: number;
  user_id: number;
  challenge_date: string;
  questions: any[];
  user_answers: number[];
  correct_count: number;
  score: number;
  time_spent: number;
  completed_at?: string;
}

export class DailyChallengeController {
  /**
   * 获取指定日期的挑战题目
   * GET /api/daily-challenge/:date
   */
  async getDailyChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;

      if (!date) {
        res.status(400).json({ error: '缺少日期参数' });
        return;
      }

      // 验证日期格式
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        res.status(400).json({ error: '无效的日期格式，请使用 YYYY-MM-DD 格式' });
        return;
      }

      // 生成每日挑战题目
      const questions = dailyTaskGenerator.generateDailyQuestions(date);

      // 返回题目（不包含答案）
      const questionsWithoutAnswers = questions.map(q => ({
        id: q.id,
        expression: q.expression,
        difficulty: q.difficulty,
        operationType: q.operationType,
        // 为选择题模式生成选项
        options: this.generateOptions(q.answer)
      }));

      res.json({
        date,
        questions: questionsWithoutAnswers,
        totalQuestions: questions.length,
        message: '每日挑战题目获取成功'
      });
    } catch (error) {
      console.error('获取每日挑战失败:', error);
      const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
      res.status(500).json({ error: errorMessage });
    }
  }

  /**
   * 提交每日挑战答案
   * POST /api/daily-challenge/:date/submit
   */
  async submitDailyChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      const { user_id, answers } = req.body;

      // 参数验证
      if (!date) {
        res.status(400).json({ error: '缺少日期参数' });
        return;
      }

      if (!user_id) {
        res.status(400).json({ error: '缺少用户 ID' });
        return;
      }

      if (!answers || !Array.isArray(answers)) {
        res.status(400).json({ error: '缺少答案数组' });
        return;
      }

      // 获取当日题目
      const questions = dailyTaskGenerator.generateDailyQuestions(date);

      if (answers.length !== questions.length) {
        res.status(400).json({
          error: `答案数量不匹配，需要 ${questions.length} 道题的答案`
        });
        return;
      }

      // 计算正确率和分数
      let correctCount = 0;
      const results = questions.map((q, index) => {
        const isCorrect = answers[index] === q.answer;
        if (isCorrect) correctCount++;
        return {
          questionId: q.id,
          expression: q.expression,
          userAnswer: answers[index],
          correctAnswer: q.answer,
          isCorrect
        };
      });

      // 计算分数（每题 10 分）
      const baseScore = correctCount * 10;

      // 保存提交记录
      const submissionData = {
        user_id,
        challenge_date: date,
        questions: questions.map(q => ({
          id: q.id,
          expression: q.expression,
          answer: q.answer
        })),
        user_answers: answers,
        correct_count: correctCount,
        score: baseScore,
        time_spent: req.body.time_spent || 0
      };

      const submissionId = await this.saveSubmission(submissionData);

      // 将错题加入错题本
      await this.addWrongQuestions(user_id, questions, answers);

      res.json({
        submission_id: submissionId,
        date,
        correct_count: correctCount,
        total_questions: questions.length,
        score: baseScore,
        results,
        achievement: this.getAchievement(correctCount),
        message: '挑战提交成功'
      });
    } catch (error) {
      console.error('提交每日挑战失败:', error);
      const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
      res.status(500).json({ error: errorMessage });
    }
  }

  /**
   * 获取用户学习日历
   * GET /api/study-calendar
   */
  async getStudyCalendar(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, year, month } = req.query;

      if (!user_id) {
        res.status(400).json({ error: '缺少用户 ID' });
        return;
      }

      const userId = Number(user_id);
      const targetYear = year ? Number(year) : new Date().getFullYear();
      const targetMonth = month ? Number(month) - 1 : new Date().getMonth();

      // 计算该月的起止日期
      const startDate = new Date(targetYear, targetMonth, 1);
      const endDate = new Date(targetYear, targetMonth + 1, 0);

      const startDateStr = this.formatDate(startDate);
      const endDateStr = this.formatDate(endDate);

      // 查询用户在该月的学习记录
      const records = await db.query(`
        SELECT
          challenge_date,
          COUNT(*) as challenge_count,
          MAX(correct_count) as best_correct,
          MAX(score) as best_score
        FROM daily_challenge_submissions
        WHERE user_id = ?
          AND challenge_date >= ?
          AND challenge_date <= ?
        GROUP BY challenge_date
        ORDER BY challenge_date
      `, [userId, startDateStr, endDateStr]);

      // 查询签到记录
      const checkInRecords = await db.query(`
        SELECT date
        FROM daily_check_ins
        WHERE user_id = ?
          AND date >= ?
          AND date <= ?
      `, [userId, startDateStr, endDateStr]);

      // 构建日历数据
      const calendarData: Record<string, any> = {};

      // 初始化该月每一天的数据
      for (let d = 1; d <= endDate.getDate(); d++) {
        const dateKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        calendarData[dateKey] = {
          date: dateKey,
          hasChallenge: false,
          challengeCount: 0,
          bestCorrect: 0,
          bestScore: 0,
          hasCheckIn: false,
          streak: 0
        };
      }

      // 填充挑战记录
      records.forEach((record: any) => {
        if (calendarData[record.challenge_date]) {
          calendarData[record.challenge_date].hasChallenge = true;
          calendarData[record.challenge_date].challengeCount = record.challenge_count;
          calendarData[record.challenge_date].bestCorrect = record.best_correct;
          calendarData[record.challenge_date].bestScore = record.best_score;
        }
      });

      // 填充签到记录
      checkInRecords.forEach((record: any) => {
        if (calendarData[record.date]) {
          calendarData[record.date].hasCheckIn = true;
        }
      });

      // 计算连续签到天数
      const streak = await this.calculateCheckInStreak(userId);

      res.json({
        year: targetYear,
        month: targetMonth + 1,
        totalDays: endDate.getDate(),
        challengeDays: records.length,
        checkInDays: checkInRecords.length,
        currentStreak: streak,
        calendar: calendarData,
        message: '学习日历获取成功'
      });
    } catch (error) {
      console.error('获取学习日历失败:', error);
      const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
      res.status(500).json({ error: errorMessage });
    }
  }

  /**
   * 今日签到
   * POST /api/check-in
   */
  async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.body;

      if (!user_id) {
        res.status(400).json({ error: '缺少用户 ID' });
        return;
      }

      const userId = Number(user_id);
      const today = this.formatDate(new Date());

      // 检查是否已签到
      const existingCheckIn = await db.get(`
        SELECT * FROM daily_check_ins
        WHERE user_id = ? AND date = ?
      `, [userId, today]);

      if (existingCheckIn) {
        res.status(400).json({
          error: '今日已签到',
          already_checked_in: true,
          date: today
        });
        return;
      }

      // 插入签到记录
      await db.execute(`
        INSERT INTO daily_check_ins (user_id, date)
        VALUES (?, ?)
      `, [userId, today]);

      // 计算当前连续签到天数
      const streak = await this.calculateCheckInStreak(userId);

      // 计算签到奖励积分
      const bonusPoints = this.calculateCheckInBonus(streak);

      res.json({
        success: true,
        date: today,
        streak,
        bonus_points: bonusPoints,
        message: '签到成功'
      });
    } catch (error) {
      console.error('签到失败:', error);
      const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
      res.status(500).json({ error: errorMessage });
    }
  }

  /**
   * 为选择题生成选项
   */
  private generateOptions(correctAnswer: number): number[] {
    const options = new Set<number>();
    options.add(correctAnswer);

    // 生成 3 个干扰选项
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5; // -5 到 5
      const distractor = correctAnswer + offset;
      if (distractor > 0 && distractor !== correctAnswer) {
        options.add(distractor);
      }
    }

    // 打乱选项顺序
    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  /**
   * 保存提交记录到数据库
   */
  private async saveSubmission(data: Omit<DailyChallengeSubmission, 'id' | 'completed_at'>): Promise<number> {
    const sql = `
      INSERT INTO daily_challenge_submissions
      (user_id, challenge_date, questions, user_answers, correct_count, score, time_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    return db.execute(sql, [
      data.user_id,
      data.challenge_date,
      JSON.stringify(data.questions),
      JSON.stringify(data.user_answers),
      data.correct_count,
      data.score,
      data.time_spent
    ]);
  }

  /**
   * 将错题加入错题本
   */
  private async addWrongQuestions(
    userId: number,
    questions: any[],
    answers: number[]
  ): Promise<void> {
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] !== questions[i].answer) {
        // 这是一道错题
        try {
          await db.execute(`
            INSERT INTO wrong_questions
            (user_id, expression, user_answer, correct_answer, difficulty, operation_type)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            userId,
            questions[i].expression,
            answers[i],
            questions[i].answer,
            questions[i].difficulty,
            questions[i].operationType
          ]);
        } catch (error) {
          // 忽略重复插入的错误（可能已存在）
          console.warn('插入错题失败:', error);
        }
      }
    }
  }

  /**
   * 获取成就称号
   */
  private getAchievement(correctCount: number): string {
    if (correctCount === 10) return '🏆 完美挑战';
    if (correctCount >= 8) return '🌟 优秀表现';
    if (correctCount >= 6) return '👍 继续努力';
    if (correctCount >= 4) return '📚 加油练习';
    return '💪 永不放弃';
  }

  /**
   * 计算连续签到天数
   */
  private async calculateCheckInStreak(userId: number): Promise<number> {
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = this.formatDate(currentDate);
      const record = await db.get(`
        SELECT * FROM daily_check_ins
        WHERE user_id = ? AND date = ?
      `, [userId, dateStr]);

      if (!record) {
        break;
      }

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * 计算签到奖励积分
   */
  private calculateCheckInBonus(streak: number): number {
    if (streak >= 30) return 50; // 月度全勤
    if (streak >= 14) return 30; // 连续两周
    if (streak >= 7) return 20;  // 连续一周
    if (streak >= 3) return 10;  // 连续三天
    return 5; // 基础奖励
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export default new DailyChallengeController();
