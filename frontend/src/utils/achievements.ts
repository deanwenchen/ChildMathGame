/**
 * 成就系统定义和解锁逻辑
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: AchievementState) => boolean;
  notified?: boolean;
}

export interface AchievementState {
  currentStreak: number;
  maxStreak: number;
  correctCount: number;
  totalQuestions: number;
  questionTime: number; // 当前题用时（秒）
  isPerfectGame: boolean; // 是否全对
}

/**
 * 成就列表定义
 */
export const achievements: Achievement[] = [
  // 连胜类成就
  {
    id: 'streak_3',
    name: '初露锋芒',
    description: '连续答对 3 题',
    icon: '🔥',
    condition: (state) => state.currentStreak >= 3
  },
  {
    id: 'streak_5',
    name: '连胜达人',
    description: '连续答对 5 题',
    icon: '🌟',
    condition: (state) => state.currentStreak >= 5
  },
  {
    id: 'streak_10',
    name: '不败战神',
    description: '连续答对 10 题',
    icon: '👑',
    condition: (state) => state.currentStreak >= 10
  },
  // 速度类成就
  {
    id: 'speed_10',
    name: '速算小能手',
    description: '10 秒内答对一题',
    icon: '⚡',
    condition: (state) => state.questionTime <= 10 && state.correctCount > 0
  },
  {
    id: 'speed_5',
    name: '闪电计算',
    description: '5 秒内答对一题',
    icon: '🚀',
    condition: (state) => state.questionTime <= 5 && state.correctCount > 0
  },
  // 完美类成就
  {
    id: 'perfect_game',
    name: '完美表现',
    description: '10 题全对',
    icon: '🏆',
    condition: (state) => state.isPerfectGame
  },
  {
    id: 'accuracy_90',
    name: '准确率大师',
    description: '准确率达到 90% 以上',
    icon: '🎯',
    condition: (state) => state.totalQuestions >= 5 && (state.correctCount / state.totalQuestions) >= 0.9
  }
];

/**
 * 检查并解锁成就
 * @param state 当前游戏状态
 * @param unlockedIds 已解锁成就 ID 列表
 * @returns 新解锁的成就列表
 */
export const checkAchievements = (
  state: AchievementState,
  unlockedIds: string[] = []
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of achievements) {
    if (!unlockedIds.includes(achievement.id) && achievement.condition(state)) {
      newlyUnlocked.push({ ...achievement, notified: true });
    }
  }

  return newlyUnlocked;
};

/**
 * 获取成就等级标题
 */
export const getAchievementTitle = (score: number): string => {
  if (score >= 90) return '🌟 算术大师';
  if (score >= 70) return '⭐ 算术高手';
  if (score >= 50) return '✨ 算术能手';
  return '💪 继续努力';
};
