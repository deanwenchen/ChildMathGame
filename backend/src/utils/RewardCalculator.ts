/**
 * 奖励计算器 - 游戏化奖励系统核心逻辑
 *
 * 设计原则：
 * 1. 正向强化：连击加成提供即时反馈
 * 2. 损失规避：补签机制减少挫败感
 * 3. 适度挑战：奖励数值平衡，避免通胀
 *
 * @see pedagogy.md - 教学对齐文档
 */

import { Medal, MedalDefinition } from './MedalSystem';

/**
 * 签到奖励配置表
 * 连续天数 -> 金币奖励 + 勋章
 */
const CHECK_IN_REWARDS: Array<{
  streak: number;
  coins: number;
  medalId?: string;
}> = [
  { streak: 1, coins: 10 },
  { streak: 3, coins: 30, medalId: 'medal_beginner' },
  { streak: 7, coins: 70, medalId: 'medal_persistent' },
  { streak: 14, coins: 140, medalId: 'medal_perseverance' },
  { streak: 30, coins: 300, medalId: 'medal_learner' },
  { streak: 100, coins: 1000, medalId: 'medal_champion' },
];

/**
 * 每日挑战奖励配置
 */
const DAILY_CHALLENGE_CONFIG = {
  baseReward: 20,        // 完成挑战基础奖励
  perfectBonus: 30,      // 100% 正确率额外奖励
  comboReward: 2,        // 每连对 1 题奖励
  maxComboBonus: 40,     // 连击奖励上限 (20 题)
};

/**
 * 补签配置
 */
const MAKEUP_CONFIG = {
  costPerDay: 50,        // 每缺席 1 天成本
  maxMakeupDays: 7,      // 最大补签天数
};

/**
 * 签到奖励结果
 */
export interface CheckInReward {
  coins: number;
  medal?: Medal;
  isMakeup: boolean;
  makeupCost?: number;
}

/**
 * RewardCalculator - 奖励计算核心类
 *
 * 功能：
 * - 计算签到奖励（含补签逻辑）
 * - 计算每日挑战奖励
 * - 验证补签资格
 */
export class RewardCalculator {

  /**
   * 计算签到奖励
   *
   * @param streak 当前连续签到天数
   * @param isMakeup 是否为补签
   * @param makeupDays 补签天数（仅补签时有效）
   * @param userCoins 用户当前金币数（用于验证补签能力）
   * @returns 签到奖励结果
   *
   * @example
   * // 正常签到，连续 7 天
   * calculateCheckInReward(7)
   * // -> { coins: 70, medal: {...}, isMakeup: false }
   *
   * @example
   * // 补签 2 天，当前连续 5 天
   * calculateCheckInReward(5, true, 2, 200)
   * // -> { coins: 70, medal: {...}, isMakeup: true, makeupCost: 100 }
   */
  calculateCheckInReward(
    streak: number,
    isMakeup: boolean = false,
    makeupDays: number = 0,
    userCoins: number = 0
  ): CheckInReward {
    // 找到当前连续天数对应的奖励
    let reward = CHECK_IN_REWARDS[0]; // 默认 1 天奖励

    for (const config of CHECK_IN_REWARDS) {
      if (streak >= config.streak) {
        reward = config;
      }
    }

    const result: CheckInReward = {
      coins: reward.coins,
      isMakeup,
    };

    // 如果有勋章资格，添加勋章
    if (reward.medalId) {
      const medalSystem = new MedalSystem();
      const medal = medalSystem.getMedalById(reward.medalId);
      if (medal) {
        result.medal = medal;
      }
    }

    // 如果是补签，计算成本
    if (isMakeup && makeupDays > 0) {
      const makeupCost = this.calculateMakeupCost(makeupDays);
      result.makeupCost = makeupCost;

      // 补签需要扣除金币
      if (userCoins >= makeupCost) {
        result.coins = Math.max(0, result.coins - makeupCost);
      } else {
        // 金币不足，补签失败
        result.coins = 0;
        result.medal = undefined;
      }
    }

    return result;
  }

  /**
   * 计算每日挑战奖励
   *
   * @param accuracy 正确率 (0-1)
   * @param combo 连击数
   * @returns 金币奖励数量
   *
   * @example
   * // 100% 正确率，连击 10 题
   * calculateDailyChallengeReward(1.0, 10)
   * // -> 70 (20 基础 + 30 完美 + 20 连击)
   *
   * @example
   * // 80% 正确率，连击 5 题
   * calculateDailyChallengeReward(0.8, 5)
   * // -> 30 (20 基础 + 10 连击)
   */
  calculateDailyChallengeReward(
    accuracy: number,
    combo: number
  ): number {
    // 基础奖励（只要完成挑战就有）
    let totalReward = DAILY_CHALLENGE_CONFIG.baseReward;

    // 完美奖励（100% 正确率）
    if (accuracy === 1.0) {
      totalReward += DAILY_CHALLENGE_CONFIG.perfectBonus;
    }

    // 连击奖励（有上限）
    const comboBonus = Math.min(
      combo * DAILY_CHALLENGE_CONFIG.comboReward,
      DAILY_CHALLENGE_CONFIG.maxComboBonus
    );
    totalReward += comboBonus;

    return totalReward;
  }

  /**
   * 计算补签成本
   *
   * @param daysMissed 缺席天数
   * @returns 补签所需金币
   *
   * @example
   * calculateMakeupCost(3) // -> 150
   */
  calculateMakeupCost(daysMissed: number): number {
    // 限制最大补签天数
    const validDays = Math.min(daysMissed, MAKEUP_CONFIG.maxMakeupDays);
    return validDays * MAKEUP_CONFIG.costPerDay;
  }

  /**
   * 判断是否可以补签
   *
   * @param missedDate 缺席日期 (ISO 8601 格式)
   * @param userCoins 用户当前金币数
   * @param today 今天日期 (ISO 8601 格式)
   * @returns 是否可以补签
   *
   * @example
   * // 7 天内缺席，金币充足
   * canMakeUp('2026-02-28', 100, '2026-03-03') // -> true
   *
   * @example
   * // 超过 7 天，无法补签
   * canMakeUp('2026-02-20', 100, '2026-03-03') // -> false
   */
  canMakeUp(
    missedDate: string,
    userCoins: number,
    today: string = new Date().toISOString()
  ): boolean {
    const missed = new Date(missedDate);
    const currentDate = new Date(today);

    // 计算日期差（天）
    const diffTime = currentDate.getTime() - missed.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 只能补签过去 7 天内的缺席
    if (diffDays < 1 || diffDays > MAKEUP_CONFIG.maxMakeupDays) {
      return false;
    }

    // 检查金币是否足够
    const cost = this.calculateMakeupCost(diffDays);
    return userCoins >= cost;
  }

  /**
   * 获取补签范围（可补签的日期列表）
   *
   * @param today 今天日期
   * @returns 可补签的日期列表（ISO 8601 格式）
   */
  getMakeupRange(today: string = new Date().toISOString()): string[] {
    const dates: string[] = [];
    const currentDate = new Date(today);

    for (let i = 1; i <= MAKEUP_CONFIG.maxMakeupDays; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }
}

export default RewardCalculator;
