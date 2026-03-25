/**
 * 勋章系统 - 游戏化成就管理
 *
 * 设计原则：
 * 1. 目标梯度效应：越接近目标越有动力
 * 2. 可视化成就：勋章作为学习历程的见证
 * 3. 适度挑战：勋章获取有难度但可达
 *
 * @see pedagogy.md - 教学对齐文档
 */

/**
 * 勋章定义接口
 */
export interface MedalDefinition {
  /** 勋章唯一标识 */
  id: string;
  /** 勋章名称 */
  name: string;
  /** 勋章描述 */
  description: string;
  /** 勋章 Emoji 图标 */
  icon: string;
  /** 获取条件：连续签到天数 */
  requiredStreak: number;
  /** 勋章稀有度 */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  /** 勋章颜色（16 进制） */
  color: string;
}

/**
 * 勋章实例（用户获得的勋章）
 */
export interface Medal extends MedalDefinition {
  /** 获得时间 */
  earnedAt: string;
}

/**
 * 所有勋章定义
 *
 * 设计说明：
 * - 6 个勋章对应 6 个里程碑
 * - 稀有度递增，激励持续学习
 * - 颜色从普通到传说，视觉差异化
 */
const MEDAL_DEFINITIONS: MedalDefinition[] = [
  {
    id: 'medal_beginner',
    name: '初出茅庐',
    description: '连续签到 3 天，学习之旅刚刚开始',
    icon: '🌱',
    requiredStreak: 3,
    rarity: 'common',
    color: '#8BC34A', // 浅绿
  },
  {
    id: 'medal_persistent',
    name: '持之以恒',
    description: '连续签到 7 天，坚持就是胜利',
    icon: '🔥',
    requiredStreak: 7,
    rarity: 'uncommon',
    color: '#FF9800', // 橙色
  },
  {
    id: 'medal_perseverance',
    name: '坚持不懈',
    description: '连续签到 14 天，你已经很棒了',
    icon: '⭐',
    requiredStreak: 14,
    rarity: 'rare',
    color: '#2196F3', // 蓝色
  },
  {
    id: 'medal_learner',
    name: '学习达人',
    description: '连续签到 30 天，学习已成为习惯',
    icon: '🏆',
    requiredStreak: 30,
    rarity: 'epic',
    color: '#9C27B0', // 紫色
  },
  {
    id: 'medal_champion',
    name: '学霸之王',
    description: '连续签到 100 天，你是真正的学习王者',
    icon: '👑',
    requiredStreak: 100,
    rarity: 'legendary',
    color: '#FFD700', // 金色
  },
];

/**
 * MedalSystem - 勋章管理类
 *
 * 功能：
 * - 检查用户是否符合勋章获取条件
 * - 获取勋章定义
 * - 获取所有勋章列表
 */
export class MedalSystem {
  private medals: MedalDefinition[] = MEDAL_DEFINITIONS;

  /**
   * 检查用户是否符合勋章获取条件
   *
   * @param streak 用户当前连续签到天数
   * @param userMedals 用户已获得的勋章 ID 列表
   * @returns 符合资格的新勋章列表
   *
   * @example
   * // 连续签到 7 天，未获得任何勋章
   * checkEligibility(7, [])
   * // -> [{ id: 'medal_beginner', ... }, { id: 'medal_persistent', ... }]
   *
   * @example
   * // 连续签到 7 天，已获得初出茅庐
   * checkEligibility(7, ['medal_beginner'])
   * // -> [{ id: 'medal_persistent', ... }]
   */
  checkEligibility(
    streak: number,
    userMedals: string[]
  ): Medal[] {
    const eligibleMedals: Medal[] = [];

    for (const medal of this.medals) {
      // 检查是否符合连续天数要求
      if (streak >= medal.requiredStreak) {
        // 检查是否尚未获得
        if (!userMedals.includes(medal.id)) {
          eligibleMedals.push({
            ...medal,
            earnedAt: new Date().toISOString(),
          });
        }
      }
    }

    return eligibleMedals;
  }

  /**
   * 根据 ID 获取勋章定义
   *
   * @param id 勋章 ID
   * @returns 勋章定义，不存在则返回 null
   *
   * @example
   * getMedalById('medal_beginner')
   * // -> { id: 'medal_beginner', name: '初出茅庐', ... }
   */
  getMedalById(id: string): MedalDefinition | null {
    return this.medals.find(medal => medal.id === id) || null;
  }

  /**
   * 获取所有勋章定义
   *
   * @param includeEarnedInfo 是否包含获得状态信息
   * @param userMedals 用户已获得的勋章 ID 列表（可选）
   * @returns 勋章列表（如提供 userMedals 则包含 earned 字段）
   *
   * @example
   * // 获取所有勋章（无用户状态）
   * getAllMedals()
   *
   * @example
   * // 获取所有勋章（含获得状态）
   * getAllMedals(true, ['medal_beginner'])
   */
  getAllMedals(
    includeEarnedInfo: boolean = false,
    userMedals: string[] = []
  ): (MedalDefinition | (MedalDefinition & { earned: boolean }))[] {
    if (!includeEarnedInfo) {
      return this.medals;
    }

    return this.medals.map(medal => ({
      ...medal,
      earned: userMedals.includes(medal.id),
    }));
  }

  /**
   * 获取勋章稀有度排序
   *
   * @returns 按稀有度排序的勋章列表（从低到高）
   */
  getMedalsByRarity(): MedalDefinition[] {
    const rarityOrder: Record<string, number> = {
      common: 0,
      uncommon: 1,
      rare: 2,
      epic: 3,
      legendary: 4,
    };

    return [...this.medals].sort(
      (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]
    );
  }

  /**
   * 获取下一个可获得的勋章
   *
   * @param currentStreak 当前连续签到天数
   * @param userMedals 用户已获得的勋章 ID 列表
   * @returns 下一个勋章信息，如无则返回 null
   */
  getNextMedal(
    currentStreak: number,
    userMedals: string[]
  ): (MedalDefinition & { progress: number; required: number }) | null {
    for (const medal of this.medals) {
      if (!userMedals.includes(medal.id)) {
        return {
          ...medal,
          progress: Math.min(currentStreak, medal.requiredStreak),
          required: medal.requiredStreak,
        };
      }
    }
    return null; // 已获得所有勋章
  }
}

export default MedalSystem;
