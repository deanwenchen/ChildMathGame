import db from '../database/database';

/**
 * 排行榜类型
 */
export type LeaderboardType = 'weekly' | 'monthly' | 'all_time';

/**
 * 排行榜条目接口
 */
export interface LeaderboardEntry {
  id?: number;
  user_id: number;
  username: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  correct_answers: number;
  quick_answers: number;
  max_combo: number;
  pk_wins: number;
  rank?: number;
  updated_at?: string;
}

/**
 * 排行榜用户统计
 */
export interface UserStats {
  user_id: number;
  username: string;
  points: number;
  correct_answers: number;
  quick_answers: number;
  max_combo: number;
  pk_wins: number;
}

/**
 * LeaderboardModel - 排行榜数据模型
 *
 * 功能：
 * - 管理排行榜数据存储
 * - 支持周榜/月榜/总榜
 * - 提供排名查询和统计功能
 */
export class LeaderboardModel {
  /**
   * 创建或更新用户排行榜数据
   */
  static async upsert(entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'updated_at'>): Promise<number> {
    const sql = `
      INSERT INTO leaderboard_entries (
        user_id, username, total_points, weekly_points, monthly_points,
        correct_answers, quick_answers, max_combo, pk_wins
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        username = excluded.username,
        total_points = excluded.total_points,
        weekly_points = excluded.weekly_points,
        monthly_points = excluded.monthly_points,
        correct_answers = excluded.correct_answers,
        quick_answers = excluded.quick_answers,
        max_combo = excluded.max_combo,
        pk_wins = excluded.pk_wins,
        updated_at = CURRENT_TIMESTAMP
    `;
    const lastId = await db.execute(sql, [
      entry.user_id,
      entry.username,
      entry.total_points,
      entry.weekly_points,
      entry.monthly_points,
      entry.correct_answers,
      entry.quick_answers,
      entry.max_combo,
      entry.pk_wins
    ]);
    return lastId;
  }

  /**
   * 根据用户ID获取排行榜数据
   */
  static async findByUserId(userId: number): Promise<LeaderboardEntry | null> {
    const sql = 'SELECT * FROM leaderboard_entries WHERE user_id = ?';
    const entry = await db.get(sql, [userId]);
    return entry;
  }

  /**
   * 获取周榜排名
   */
  static async getWeeklyRankings(limit: number = 100, offset: number = 0): Promise<LeaderboardEntry[]> {
    const sql = `
      SELECT
        le.*,
        RANK() OVER (ORDER BY le.weekly_points DESC) as rank
      FROM leaderboard_entries le
      WHERE le.weekly_points > 0
      ORDER BY le.weekly_points DESC
      LIMIT ? OFFSET ?
    `;
    const entries = await db.query(sql, [limit, offset]);
    return entries;
  }

  /**
   * 获取月榜排名
   */
  static async getMonthlyRankings(limit: number = 100, offset: number = 0): Promise<LeaderboardEntry[]> {
    const sql = `
      SELECT
        le.*,
        RANK() OVER (ORDER BY le.monthly_points DESC) as rank
      FROM leaderboard_entries le
      WHERE le.monthly_points > 0
      ORDER BY le.monthly_points DESC
      LIMIT ? OFFSET ?
    `;
    const entries = await db.query(sql, [limit, offset]);
    return entries;
  }

  /**
   * 获取总榜排名
   */
  static async getAllTimeRankings(limit: number = 100, offset: number = 0): Promise<LeaderboardEntry[]> {
    const sql = `
      SELECT
        le.*,
        RANK() OVER (ORDER BY le.total_points DESC) as rank
      FROM leaderboard_entries le
      WHERE le.total_points > 0
      ORDER BY le.total_points DESC
      LIMIT ? OFFSET ?
    `;
    const entries = await db.query(sql, [limit, offset]);
    return entries;
  }

  /**
   * 获取用户在指定榜单中的排名
   */
  static async getUserRank(userId: number, type: LeaderboardType): Promise<number> {
    const pointsColumn = type === 'weekly' ? 'weekly_points' :
                         type === 'monthly' ? 'monthly_points' : 'total_points';

    const sql = `
      SELECT COUNT(*) + 1 as rank
      FROM leaderboard_entries
      WHERE ${pointsColumn} > (
        SELECT COALESCE(${pointsColumn}, 0)
        FROM leaderboard_entries
        WHERE user_id = ?
      )
    `;
    const result = await db.get(sql, [userId]);
    return result?.rank || 0;
  }

  /**
   * 获取用户在好友中的排名
   */
  static async getFriendsRankings(
    userIds: number[],
    type: LeaderboardType,
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    if (userIds.length === 0) return [];

    const pointsColumn = type === 'weekly' ? 'weekly_points' :
                         type === 'monthly' ? 'monthly_points' : 'total_points';

    const placeholders = userIds.map(() => '?').join(',');
    const sql = `
      SELECT
        le.*,
        RANK() OVER (ORDER BY le.${pointsColumn} DESC) as rank
      FROM leaderboard_entries le
      WHERE le.user_id IN (${placeholders})
      ORDER BY le.${pointsColumn} DESC
      LIMIT ?
    `;
    const entries = await db.query(sql, [...userIds, limit]);
    return entries;
  }

  /**
   * 更新用户积分
   */
  static async updatePoints(
    userId: number,
    pointsToAdd: number,
    category: 'correct' | 'quick' | 'combo' | 'pk' = 'correct'
  ): Promise<void> {
    // 先检查用户是否存在
    const existing = await this.findByUserId(userId);

    if (!existing) {
      // 如果用户不存在，创建新记录
      const sql = `
        INSERT INTO leaderboard_entries (user_id, username, total_points, weekly_points, monthly_points, correct_answers, quick_answers, max_combo, pk_wins)
        SELECT id, username, ?, ?, ?, ?, ?, ?, ?
        FROM users
        WHERE id = ?
      `;

      const correctCount = category === 'correct' ? 1 : 0;
      const quickCount = category === 'quick' ? 1 : 0;
      const comboCount = category === 'combo' ? 1 : 0;
      const pkCount = category === 'pk' ? 1 : 0;

      await db.execute(sql, [
        pointsToAdd, pointsToAdd, pointsToAdd,
        correctCount, quickCount, comboCount, pkCount,
        userId
      ]);
    } else {
      // 更新现有记录
      const sql = `
        UPDATE leaderboard_entries
        SET
          total_points = total_points + ?,
          weekly_points = weekly_points + ?,
          monthly_points = monthly_points + ?,
          correct_answers = correct_answers + ?,
          quick_answers = quick_answers + ?,
          max_combo = CASE WHEN ? > max_combo THEN ? ELSE max_combo END,
          pk_wins = pk_wins + ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;

      const correctAdd = category === 'correct' ? 1 : 0;
      const quickAdd = category === 'quick' ? 1 : 0;
      const comboValue = category === 'combo' ? pointsToAdd : 0;
      const pkAdd = category === 'pk' ? 1 : 0;

      await db.execute(sql, [
        pointsToAdd, pointsToAdd, pointsToAdd,
        correctAdd, quickAdd, comboValue, comboValue, pkAdd,
        userId
      ]);
    }
  }

  /**
   * 重置周榜积分
   */
  static async resetWeeklyPoints(): Promise<void> {
    const sql = 'UPDATE leaderboard_entries SET weekly_points = 0';
    await db.execute(sql, []);
  }

  /**
   * 重置月榜积分
   */
  static async resetMonthlyPoints(): Promise<void> {
    const sql = 'UPDATE leaderboard_entries SET monthly_points = 0';
    await db.execute(sql, []);
  }

  /**
   * 获取排行榜顶部用户
   */
  static async getTopUsers(type: LeaderboardType, count: number = 10): Promise<LeaderboardEntry[]> {
    const pointsColumn = type === 'weekly' ? 'weekly_points' :
                         type === 'monthly' ? 'monthly_points' : 'total_points';

    const sql = `
      SELECT * FROM leaderboard_entries
      WHERE ${pointsColumn} > 0
      ORDER BY ${pointsColumn} DESC
      LIMIT ?
    `;
    const entries = await db.query(sql, [count]);
    return entries;
  }

  /**
   * 获取用户周围排名（用于显示用户排名上下文）
   */
  static async getSurroundingRankings(
    userId: number,
    type: LeaderboardType,
    range: number = 2
  ): Promise<LeaderboardEntry[]> {
    const pointsColumn = type === 'weekly' ? 'weekly_points' :
                         type === 'monthly' ? 'monthly_points' : 'total_points';

    // 获取用户当前积分
    const userEntry = await this.findByUserId(userId);
    if (!userEntry) return [];

    const userPoints = type === 'weekly' ? userEntry.weekly_points :
                       type === 'monthly' ? userEntry.monthly_points : userEntry.total_points;

    // 获取比用户积分高的用户
    const sqlHigher = `
      SELECT * FROM leaderboard_entries
      WHERE ${pointsColumn} >= ?
      ORDER BY ${pointsColumn} DESC
      LIMIT ?
    `;

    const entries = await db.query(sqlHigher, [userPoints, range * 2 + 1]);
    return entries;
  }
}

export default LeaderboardModel;