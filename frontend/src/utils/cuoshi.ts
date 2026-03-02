/**
 * 凑十法题目生成工具
 *
 * 根据《义务教育数学课程标准》（2022 年版）和 pedagogy.md 设计
 * 专注于 20 以内进位加法的凑十法练习
 */

/**
 * 凑十法题目接口
 */
export interface CuoshiQuestion {
  /** 大数（9/8/7/6）*/
  bigNumber: number;
  /** 小数 */
  smallNumber: number;
  /** 大数需要几凑成 10 */
  needToMake10: number;
  /** 小数分解结果 */
  decomposition: {
    /** 用于凑十的部分 */
    partForTen: number;
    /** 剩余部分 */
    remaining: number;
  };
  /** 最终答案 */
  answer: number;
  /** 关卡类型 */
  level: '9' | '8' | '7' | '6';
  /** 题目显示文本 */
  questionText: string;
}

/**
 * 关卡配置
 * 根据 pedagogy.md 的教学顺序和取值范围
 */
const LEVEL_CONFIG: Record<string, {
  bigNumber: number;
  minSmall: number;
  maxSmall: number;
  label: string;
  color: string;
}> = {
  '9': {
    bigNumber: 9,
    minSmall: 2,
    maxSmall: 9,
    label: '第一关：9 加几',
    color: '#4CAF50' // 绿色
  },
  '8': {
    bigNumber: 8,
    minSmall: 3,
    maxSmall: 9,
    label: '第二关：8 加几',
    color: '#2196F3' // 蓝色
  },
  '7': {
    bigNumber: 7,
    minSmall: 4,
    maxSmall: 9,
    label: '第三关：7 加几',
    color: '#FF9800' // 橙色
  },
  '6': {
    bigNumber: 6,
    minSmall: 5,
    maxSmall: 9,
    label: '第四关：6 加几',
    color: '#E91E63' // 粉色
  },
};

/**
 * 生成单个凑十法题目
 * @param level 关卡 ('9' | '8' | '7' | '6')
 * @returns CuoshiQuestion 题目对象
 */
export function generateCuoshiQuestion(level: '9' | '8' | '7' | '6'): CuoshiQuestion {
  const config = LEVEL_CONFIG[level];
  const bigNumber = config.bigNumber;

  // 随机生成小数（在有效范围内）
  const smallNumber = Math.floor(Math.random() * (config.maxSmall - config.minSmall + 1)) + config.minSmall;

  // 计算大数需要几凑成 10
  const needToMake10 = 10 - bigNumber;

  // 分解小数：一部分用于凑十，剩余部分
  const partForTen = needToMake10;
  const remaining = smallNumber - partForTen;

  // 计算答案
  const answer = 10 + remaining;

  return {
    bigNumber,
    smallNumber,
    needToMake10,
    decomposition: {
      partForTen,
      remaining,
    },
    answer,
    level,
    questionText: `${bigNumber} + ${smallNumber} = ?`,
  };
}

/**
 * 生成一组题目（用于一关）
 * @param level 关卡
 * @param count 题目数量（默认 10 题）
 * @returns 题目数组
 */
export function generateCuoshiQuestions(
  level: '9' | '8' | '7' | '6',
  count: number = 10
): CuoshiQuestion[] {
  const questions: CuoshiQuestion[] = [];

  for (let i = 0; i < count; i++) {
    questions.push(generateCuoshiQuestion(level));
  }

  return questions;
}

/**
 * 获取关卡信息
 */
export function getLevelInfo(level: '9' | '8' | '7' | '6') {
  return LEVEL_CONFIG[level];
}

/**
 * 获取所有关卡列表
 */
export function getAllLevels(): Array<{
  key: '9' | '8' | '7' | '6';
  label: string;
  color: string;
  bigNumber: number;
}> {
  return (['9', '8', '7', '6'] as const).map(key => ({
    key,
    label: LEVEL_CONFIG[key].label,
    color: LEVEL_CONFIG[key].color,
    bigNumber: LEVEL_CONFIG[key].bigNumber,
  }));
}

/**
 * 检查关卡是否解锁
 * 规则：必须完成前一关才能解锁下一关
 */
export function isLevelUnlocked(
  level: '9' | '8' | '7' | '6',
  completedLevels: { '9': boolean; '8': boolean; '7': boolean; '6': boolean }
): boolean {
  const levelOrder: ('9' | '8' | '7' | '6')[] = ['9', '8', '7', '6'];
  const currentIndex = levelOrder.indexOf(level);

  if (currentIndex === 0) return true; // 第一关总是解锁

  // 检查前一关是否完成
  const prevLevel = levelOrder[currentIndex - 1];
  return completedLevels[prevLevel];
}

/**
 * 计算星级评价
 * 根据 pedagogy.md 分层教学理念
 * @param correctCount 答对题数
 * @param total 总题数
 * @returns 星级 (0-3)
 */
export function calculateStars(correctCount: number, total: number = 10): number {
  const rate = correctCount / total;

  if (rate === 1) return 3;        // 全对：3 星
  if (rate >= 0.8) return 2;       // 80% 以上：2 星
  if (rate >= 0.6) return 1;       // 60% 以上：1 星
  return 0;                         // 低于 60%：无星
}

/**
 * 获取星级评价文字
 */
export function getStarRatingText(stars: number): string {
  const texts = ['继续加油', '不错哦', '很棒', '太厉害了'];
  return texts[Math.max(0, stars)] || texts[0];
}

/**
 * 生成凑十法分解步骤说明（用于提示和解析）
 */
export function getDecompositionSteps(question: CuoshiQuestion): string[] {
  const { bigNumber, smallNumber, decomposition } = question;

  return [
    `看大数：${bigNumber} 需要 ${decomposition.partForTen} 凑成 10`,
    `分小数：${smallNumber} 分成 ${decomposition.partForTen} 和 ${decomposition.remaining}`,
    `凑成十：${bigNumber} + ${decomposition.partForTen} = 10`,
    `加剩数：10 + ${decomposition.remaining} = ${question.answer}`,
  ];
}

/**
 * 验证答案
 */
export function checkAnswer(question: CuoshiQuestion, userAnswer: number): {
  isCorrect: boolean;
  correctAnswer: number;
} {
  return {
    isCorrect: userAnswer === question.answer,
    correctAnswer: question.answer,
  };
}
