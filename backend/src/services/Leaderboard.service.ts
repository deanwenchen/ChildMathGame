import LeaderboardModel, { LeaderboardEntry, LeaderboardType } from '../models/Leaderboard.model';
import pointsCalculator from '../utils/PointsCalculator';

/**
 * 缓存条目接口
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * 排行榜服务配置
 */
const LEADERBOARD_CONFIG = {
  // 缓存时间（毫秒）
  CACHE_TTL: 5 * 60 * 1000, // 5分钟

  // 排行榜默认大小
  DEFAULT_LIMIT: 50,

  // 排行榜最大返回数量
  MAX_LIMIT: 100,
};

/**
 * LeaderboardService - 排行榜服务
 *
 * 功能：
 * - 积分更新与管理
 * - 排行榜查询（周榜/月榜/总榜）
 * - 用户排名查询
 * - 好友排行榜
 * - 排行榜缓存
 */
export class LeaderboardService {
  private static instance: LeaderboardService;

  // 内存缓存
  private cache: Map<string, CacheEntry<any>> = new Map();

  // 定时任务引用
  private weeklyResetTimer?: NodeJS.Timeout;
  private monthlyResetTimer?: NodeJS.Timeout;

  private constructor() {}

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * 更新用户积分
   *
   * @param userId 用户ID
   * @param username 用户名
   * @param points 积分增量
   * @param category 积分类型
   */
  async updatePoints(
    userId: number,
    username: string,
    points: number,
    category: 'correct' | 'quick' | 'combo' | 'pk' = 'correct'
  ): Promise<void> {
    await LeaderboardModel.upsert({
      user_id: userId,
      username,
      total_points: points,
      weekly_points: points,
      monthly_points: points,
      correct_answers: category === 'correct' ? 1 : 0,
      quick_answers: category === 'quick' ? 1 : 0,
      max_combo: category === 'combo' ? points : 0,
      pk_wins: category === 'pk' ? 1 : 0,
    });

    // 清除相关缓存
    this.invalidateCache('leaderboard');
  }

  /**
   * 处理答题事件
   *
   * @param userId 用户ID
   * @param username 用户名
   * @param timeSpent 答题时间（秒）
   * @param isCorrect 是否正确
   * @param currentCombo 当前连击数
   * @returns 积分计算结果
   */
  async handleAnswerEvent(
    userId: number,
    username: string,
    timeSpent: number,
    isCorrect: boolean,
    currentCombo: number
  ): Promise<{
    points: number;
    breakdown: Array<{ points: number; description: string }>;
    newCombo: number;
  }> {
    if (!isCorrect) {
      return {
        points: 0,
        breakdown: [{ points: 0, description: '回答错误，连击中断' }],
        newCombo: 0
      };
    }

    const result = pointsCalculator.calculateFullPoints(timeSpent, true, currentCombo);

    // 更新数据库
    await LeaderboardModel.updatePoints(userId, result.totalPoints, 'correct');

    // 如果是快速答题，更新快速答题统计
    if (timeSpent < 5) {
      await LeaderboardModel.updatePoints(userId, 0, 'quick');
    }

    // 如果有连击，更新最大连击
    const newCombo = currentCombo + 1;
    if (newCombo > 1) {
      await LeaderboardModel.updatePoints(userId, newCombo, 'combo');
    }

    this.invalidateCache('leaderboard');

    return {
      points: result.totalPoints,
      breakdown: result.breakdown,
      newCombo
    };
  }

  /**
   * 处理PK胜利事件
   *
   * @param userId 用户ID
   * @param username 用户名
   * @param marginOfVictory 胜利优势
   * @returns 积分计算结果
   */
  async handlePKWin(
    userId: number,
    username: string,
    marginOfVictory: number = 1
  ): Promise<{ points: number; description: string }> {
    const result = pointsCalculator.calculatePKWinPoints(marginOfVictory);

    await LeaderboardModel.updatePoints(userId, result.points, 'pk');

    this.invalidateCache('leaderboard');

    return {
      points: result.points,
      description: result.description
    };
  }

  /**
   * 获取周榜
   *
   * @param limit 返回数量限制
   * @param offset 偏移量
   */
  async getWeeklyLeaderboard(limit: number = LEADERBOARD_CONFIG.DEFAULT_LIMIT, offset: number = 0): Promise<LeaderboardEntry[]> {
    const cacheKey = `weekly_leaderboard_${limit}_${offset}`;

    const cached = this.getFromCache<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const entries = await LeaderboardModel.getWeeklyRankings(
      Math.min(limit, LEADERBOARD_CONFIG.MAX_LIMIT),
      offset
    );

    this.setCache(cacheKey, entries);
    return entries;
  }

  /**
   * 获取月榜
   *
   * @param limit 返回数量限制
   * @param offset 偏移量
   */
  async getMonthlyLeaderboard(limit: number = LEADERBOARD_CONFIG.DEFAULT_LIMIT, offset: number = 0): Promise<LeaderboardEntry[]> {
    const cacheKey = `monthly_leaderboard_${limit}_${offset}`;

    const cached = this.getFromCache<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const entries = await LeaderboardModel.getMonthlyRankings(
      Math.min(limit, LEADERBOARD_CONFIG.MAX_LIMIT),
      offset
    );

    this.setCache(cacheKey, entries);
    return entries;
  }

  /**
   * 获取总榜
   *
   * @param limit 返回数量限制
   * @param offset 偏移量
   */
  async getAllTimeLeaderboard(limit: number = LEADERBOARD_CONFIG.DEFAULT_LIMIT, offset: number = 0): Promise<LeaderboardEntry[]> {
    const cacheKey = `alltime_leaderboard_${limit}_${offset}`;

    const cached = this.getFromCache<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const entries = await LeaderboardModel.getAllTimeRankings(
      Math.min(limit, LEADERBOARD_CONFIG.MAX_LIMIT),
      offset
    );

    this.setCache(cacheKey, entries);
    return entries;
  }

  /**
   * 获取用户排名
   *
   * @param userId 用户ID
   * @param type 排行榜类型
   */
  async getUserRank(userId: number, type: LeaderboardType): Promise<{
    rank: number;
    entry: LeaderboardEntry | null;
  }> {
    const rank = await LeaderboardModel.getUserRank(userId, type);
    const entry = await LeaderboardModel.findByUserId(userId);

    return { rank, entry };
  }

  /**
   * 获取好友排行榜
   *
   * @param friendIds 好友ID列表
   * @param type 排行榜类型
   * @param limit 返回数量限制
   */
  async getFriendsLeaderboard(
    friendIds: number[],
    type: LeaderboardType,
    limit: number = LEADERBOARD_CONFIG.DEFAULT_LIMIT
  ): Promise<LeaderboardEntry[]> {
    if (friendIds.length === 0) return [];

    const cacheKey = `friends_leaderboard_${type}_${friendIds.sort().join('_')}_${limit}`;

    const cached = this.getFromCache<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const entries = await LeaderboardModel.getFriendsRankings(
      friendIds,
      type,
      Math.min(limit, LEADERBOARD_CONFIG.MAX_LIMIT)
    );

    this.setCache(cacheKey, entries);
    return entries;
  }

  /**
   * 获取用户周围的排名（用于显示上下文）
   *
   * @param userId 用户ID
   * @param type 排行榜类型
   * @param range 上下范围
   */
  async getUserSurroundingRankings(
    userId: number,
    type: LeaderboardType,
    range: number = 2
  ): Promise<LeaderboardEntry[]> {
    return LeaderboardModel.getSurroundingRankings(userId, type, range);
  }

  /**
   * 获取排行榜顶部用户
   *
   * @param type 排行榜类型
   * @param count 返回数量
   */
  async getTopUsers(type: LeaderboardType, count: number = 10): Promise<LeaderboardEntry[]> {
    const cacheKey = `top_users_${type}_${count}`;

    const cached = this.getFromCache<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const entries = await LeaderboardModel.getTopUsers(type, count);
    this.setCache(cacheKey, entries);
    return entries;
  }

  /**
   * 启动定时任务
   * - 每周一 00:00 重置周榜
   * - 每月 1 日 00:00 重置月榜
   */
  startScheduledTasks(): void {
    // 计算到下一个周一 00:00 的时间
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);

    const timeUntilMonday = nextMonday.getTime() - now.getTime();

    // 设置周一重置定时器
    this.weeklyResetTimer = setTimeout(() => {
      this.resetWeeklyLeaderboard();
      // 设置每周重复
      this.weeklyResetTimer = setInterval(
        () => this.resetWeeklyLeaderboard(),
        7 * 24 * 60 * 60 * 1000
      );
    }, timeUntilMonday);

    // 计算到下月 1 日 00:00 的时间
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const timeUntilNextMonth = nextMonth.getTime() - now.getTime();

    // 设置月度重置定时器
    this.monthlyResetTimer = setTimeout(() => {
      this.resetMonthlyLeaderboard();
      // 设置每月重复（大约）
      this.monthlyResetTimer = setInterval(
        () => this.resetMonthlyLeaderboard(),
        30 * 24 * 60 * 60 * 1000 // 近似值，实际会在每月1日重新计算
      );
    }, timeUntilNextMonth);

    console.log('[LeaderboardService] 定时任务已启动');
    console.log(`[LeaderboardService] 下次周榜重置: ${nextMonday.toISOString()}`);
    console.log(`[LeaderboardService] 下次月榜重置: ${nextMonth.toISOString()}`);
  }

  /**
   * 停止定时任务
   */
  stopScheduledTasks(): void {
    if (this.weeklyResetTimer) {
      clearTimeout(this.weeklyResetTimer);
      clearInterval(this.weeklyResetTimer as unknown as NodeJS.Timeout);
    }
    if (this.monthlyResetTimer) {
      clearTimeout(this.monthlyResetTimer);
      clearInterval(this.monthlyResetTimer as unknown as NodeJS.Timeout);
    }
    console.log('[LeaderboardService] 定时任务已停止');
  }

  /**
   * 重置周榜
   */
  async resetWeeklyLeaderboard(): Promise<void> {
    console.log('[LeaderboardService] 正在重置周榜...');
    await LeaderboardModel.resetWeeklyPoints();
    this.invalidateCache('leaderboard');
    console.log('[LeaderboardService] 周榜重置完成');
  }

  /**
   * 重置月榜
   */
  async resetMonthlyLeaderboard(): Promise<void> {
    console.log('[LeaderboardService] 正在重置月榜...');
    await LeaderboardModel.resetMonthlyPoints();
    this.invalidateCache('leaderboard');
    console.log('[LeaderboardService] 月榜重置完成');
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * 设置缓存
   */
  private setCache<T>(key: string, data: T, ttl: number = LEADERBOARD_CONFIG.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 清除缓存
   */
  private invalidateCache(pattern: string): void {
    if (pattern === 'leaderboard') {
      // 清除所有排行榜相关缓存
      for (const key of this.cache.keys()) {
        if (key.includes('leaderboard') || key.includes('top_users')) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.delete(pattern);
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * 获取用户积分等级信息
   *
   * @param userId 用户ID
   */
  async getUserPointsLevel(userId: number): Promise<{
    level: string;
    title: string;
    nextLevel: number;
    currentPoints: number;
  } | null> {
    const entry = await LeaderboardModel.findByUserId(userId);
    if (!entry) return null;

    const levelInfo = pointsCalculator.getPointsLevel(entry.total_points);

    return {
      ...levelInfo,
      currentPoints: entry.total_points
    };
  }
}

export default LeaderboardService.getInstance();