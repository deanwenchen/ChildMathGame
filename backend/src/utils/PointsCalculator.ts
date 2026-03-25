/**
 * PointsCalculator - 积分计算工具
 *
 * 积分规则：
 * - 正确答题: 10分
 * - 快速答题(<5秒): +5分
 * - 连击加成: combo * 2
 * - PK胜利: 50分
 *
 * 设计原则：
 * - 鼓励正确率和速度
 * - 连击系统提供即时反馈
 * - PK胜利给予较高奖励，增加竞争动力
 */

/**
 * 积分事件类型
 */
export type PointsEventType = 'correct_answer' | 'quick_answer' | 'combo' | 'pk_win';

/**
 * 积分计算结果
 */
export interface PointsResult {
  points: number;
  eventType: PointsEventType;
  description: string;
}

/**
 * 积分配置
 */
export const POINTS_CONFIG = {
  // 正确答题基础积分
  CORRECT_ANSWER: 10,

  // 快速答题奖励（5秒内）
  QUICK_ANSWER_THRESHOLD: 5, // 秒
  QUICK_ANSWER_BONUS: 5,

  // 连击加成
  COMBO_MULTIPLIER: 2,
  MAX_COMBO_BONUS: 50, // 最大连击奖励上限

  // PK胜利奖励
  PK_WIN: 50,

  // 完美答题额外奖励（正确+快速）
  PERFECT_BONUS: 5,

  // 连续答对里程碑奖励
  COMBO_MILESTONES: [
    { combo: 5, bonus: 10, label: '初露锋芒' },
    { combo: 10, bonus: 25, label: '渐入佳境' },
    { combo: 20, bonus: 50, label: '势如破竹' },
    { combo: 50, bonus: 150, label: '算术大师' },
  ],
} as const;

/**
 * PointsCalculator - 积分计算器类
 */
export class PointsCalculator {
  private static instance: PointsCalculator;

  private constructor() {}

  public static getInstance(): PointsCalculator {
    if (!PointsCalculator.instance) {
      PointsCalculator.instance = new PointsCalculator();
    }
    return PointsCalculator.instance;
  }

  /**
   * 计算正确答题积分
   *
   * @param timeSpent 答题用时（秒）
   * @param isCorrect 是否答对
   * @returns 积分结果
   *
   * @example
   * // 3秒答对（快速答题）
   * calculateAnswerPoints(3, true)
   * // -> { points: 15, eventType: 'quick_answer', description: '快速答对 +5分奖励' }
   */
  calculateAnswerPoints(timeSpent: number, isCorrect: boolean): PointsResult {
    if (!isCorrect) {
      return {
        points: 0,
        eventType: 'correct_answer',
        description: '回答错误，不获得积分'
      };
    }

    let points = POINTS_CONFIG.CORRECT_ANSWER;
    let description = '答对了！+10分';
    let eventType: PointsEventType = 'correct_answer';

    // 快速答题奖励
    if (timeSpent < POINTS_CONFIG.QUICK_ANSWER_THRESHOLD) {
      points += POINTS_CONFIG.QUICK_ANSWER_BONUS;
      description = `快速答对！+${points}分（基础10分 + 快速奖励5分）`;
      eventType = 'quick_answer';
    }

    return { points, eventType, description };
  }

  /**
   * 计算连击加成积分
   *
   * @param combo 当前连击数
   * @returns 连击加成积分
   *
   * @example
   * calculateComboBonus(5)  // -> { points: 10, ... }
   * calculateComboBonus(10) // -> { points: 20, ... }
   */
  calculateComboBonus(combo: number): PointsResult {
    if (combo <= 1) {
      return {
        points: 0,
        eventType: 'combo',
        description: '连击开始'
      };
    }

    // 连击加成 = combo * 2，有上限
    const comboBonus = Math.min(
      combo * POINTS_CONFIG.COMBO_MULTIPLIER,
      POINTS_CONFIG.MAX_COMBO_BONUS
    );

    // 检查是否达到里程碑
    const milestone = POINTS_CONFIG.COMBO_MILESTONES
      .slice()
      .reverse()
      .find(m => combo >= m.combo);

    const description = milestone
      ? `${milestone.label}！连击${combo}次，+${comboBonus}分`
      : `连击${combo}次！+${comboBonus}分`;

    return {
      points: comboBonus,
      eventType: 'combo',
      description
    };
  }

  /**
   * 计算PK胜利积分
   *
   * @param marginOfVictory 胜利优势（答对题数差）
   * @returns PK胜利积分
   *
   * @example
   * calculatePKWinPoints(3) // 以3题优势获胜
   * // -> { points: 50, ... }
   */
  calculatePKWinPoints(marginOfVictory: number = 1): PointsResult {
    const basePoints = POINTS_CONFIG.PK_WIN;

    // 大胜奖励：每多对1题额外+5分，最多+20
    const bonusPoints = Math.min((marginOfVictory - 1) * 5, 20);
    const totalPoints = basePoints + bonusPoints;

    const description = marginOfVictory > 3
      ? `PK大胜！+${totalPoints}分（基础50分 + 优势奖励${bonusPoints}分）`
      : `PK胜利！+${totalPoints}分`;

    return {
      points: totalPoints,
      eventType: 'pk_win',
      description
    };
  }

  /**
   * 计算完整答题积分（包含连击）
   *
   * @param timeSpent 答题用时（秒）
   * @param isCorrect 是否答对
   * @param currentCombo 当前连击数（答题前）
   * @returns 总积分和详细信息
   *
   * @example
   * // 3秒答对，这是第5次连击
   * calculateFullPoints(3, true, 4)
   * // -> { totalPoints: 25, breakdown: [...] }
   */
  calculateFullPoints(
    timeSpent: number,
    isCorrect: boolean,
    currentCombo: number
  ): {
    totalPoints: number;
    breakdown: PointsResult[];
  } {
    const breakdown: PointsResult[] = [];

    if (!isCorrect) {
      breakdown.push({
        points: 0,
        eventType: 'correct_answer',
        description: '回答错误，连击中断'
      });
      return { totalPoints: 0, breakdown };
    }

    // 基础答题积分
    const answerResult = this.calculateAnswerPoints(timeSpent, true);
    breakdown.push(answerResult);

    // 连击加成
    const newCombo = currentCombo + 1;
    if (newCombo > 1) {
      const comboResult = this.calculateComboBonus(newCombo);
      breakdown.push(comboResult);
    }

    const totalPoints = breakdown.reduce((sum, r) => sum + r.points, 0);

    return { totalPoints, breakdown };
  }

  /**
   * 获取连击里程碑
   *
   * @param combo 当前连击数
   * @returns 里程碑信息（如果达到）
   */
  getComboMilestone(combo: number): { bonus: number; label: string } | null {
    const milestone = POINTS_CONFIG.COMBO_MILESTONES
      .slice()
      .reverse()
      .find(m => combo === m.combo);

    return milestone || null;
  }

  /**
   * 计算练习模式总积分
   *
   * @param correctAnswers 正确答案数
   * @param totalQuestions 总题数
   * @param avgTimePerQuestion 平均每题用时
   * @param maxCombo 最大连击数
   * @returns 总积分
   */
  calculatePracticeSessionPoints(
    correctAnswers: number,
    totalQuestions: number,
    avgTimePerQuestion: number,
    maxCombo: number
  ): number {
    let totalPoints = 0;

    // 正确答题基础积分
    totalPoints += correctAnswers * POINTS_CONFIG.CORRECT_ANSWER;

    // 快速答题奖励
    if (avgTimePerQuestion < POINTS_CONFIG.QUICK_ANSWER_THRESHOLD) {
      totalPoints += correctAnswers * POINTS_CONFIG.QUICK_ANSWER_BONUS;
    }

    // 最大连击奖励（一次性奖励）
    if (maxCombo > 1) {
      totalPoints += Math.min(
        maxCombo * POINTS_CONFIG.COMBO_MULTIPLIER,
        POINTS_CONFIG.MAX_COMBO_BONUS
      );
    }

    return totalPoints;
  }

  /**
   * 获取积分等级描述
   *
   * @param points 总积分
   * @returns 等级描述
   */
  getPointsLevel(points: number): { level: string; title: string; nextLevel: number } {
    const levels = [
      { min: 0, level: '1', title: '算术新手', nextLevel: 100 },
      { min: 100, level: '2', title: '算术学徒', nextLevel: 500 },
      { min: 500, level: '3', title: '算术能手', nextLevel: 1000 },
      { min: 1000, level: '4', title: '算术高手', nextLevel: 2500 },
      { min: 2500, level: '5', title: '算术专家', nextLevel: 5000 },
      { min: 5000, level: '6', title: '算术大师', nextLevel: 10000 },
      { min: 10000, level: '7', title: '算术宗师', nextLevel: 25000 },
      { min: 25000, level: '8', title: '算术传奇', nextLevel: 50000 },
      { min: 50000, level: '9', title: '算术神话', nextLevel: Infinity },
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].min) {
        return levels[i];
      }
    }

    return levels[0];
  }
}

export default PointsCalculator.getInstance();