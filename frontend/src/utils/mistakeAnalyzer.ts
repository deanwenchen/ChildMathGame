/**
 * 错题分析工具 - 错题本核心逻辑
 *
 * 功能：
 * 1. 捕获错题并记录
 * 2. 分析错误类型
 * 3. 根据艾宾浩斯曲线生成复习队列
 * 4. 生成变式题（可选）
 */

import { MistakeRecord, ErrorType, ReviewInterval, MistakeBookStats } from '../types';

/**
 * 艾宾浩斯复习间隔（天）
 * 索引 0 = 第 1 次复习（1 天后）
 * 索引 1 = 第 2 次复习（2 天后）
 * 索引 2 = 第 3 次复习（4 天后）
 * 索引 3 = 第 4 次复习（7 天后）
 * 索引 4 = 第 5 次复习（15 天后）
 */
export const REVIEW_INTERVALS: ReviewInterval[] = [1, 2, 4, 7, 15];

/**
 * Local Storage Key
 */
const STORAGE_KEY = 'mistakeBook_v1';

/**
 * 获取今日日期字符串（YYYY-MM-DD）
 */
export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * 获取日期字符串（YYYY-MM-DD）
 */
export const getDatestring = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 计算给定天数后的日期字符串
 */
export const getFutureDateString = (days: number): string => {
  const future = new Date();
  future.setDate(future.getDate() + days);
  return getDatestring(future);
};

/**
 * 判断一个日期是否在今天或之前（需要复习）
 */
export const isDueForReview = (nextReviewDate: string): boolean => {
  const today = getTodayString();
  return nextReviewDate <= today;
};

/**
 * 分析错误类型
 *
 * 根据用户答案和正确答案的差异，以及题目类型，分析可能的错误原因
 *
 * @param expression 题目表达式（如 "9+5"）
 * @param userAnswer 用户答案
 * @param correctAnswer 正确答案
 * @param timeSpent 答题用时（秒）
 */
export const analyzeErrorType = (
  expression: string,
  userAnswer: number,
  correctAnswer: number,
  timeSpent?: number
): ErrorType => {
  // 超时错误
  if (timeSpent !== undefined && timeSpent > 30) {
    return 'timeout';
  }

  // 解析表达式，提取两个加数
  const match = expression.match(/(\d+)\s*\+\s*(\d+)/);
  if (!match) {
    return 'unknown';
  }

  const num1 = parseInt(match[1], 10);
  const num2 = parseInt(match[2], 10);

  // 凑十法的关键步骤：
  // 1. 确定需要拆分的数（通常是小数）
  // 2. 拆分后凑成 10
  // 3. 10 加剩余数

  // 计算凑十需要的数
  const complementTo10 = 10 - num1; // 9 需要 1, 8 需要 2, etc.

  // 常见错误模式分析

  // 错误类型 1：分解错误 - 拆分小数时出错
  // 例如：9+5，把 5 拆成 2 和 3（应该是 1 和 4）
  // 这会导致后续计算全部错误
  if (userAnswer === num1 + (num2 - 1)) {
    // 比正确答案少 1，可能是拆分多了 1
    return 'decomposition_error';
  }
  if (userAnswer === num1 + (num2 + 1)) {
    // 比正确答案多 1，可能是拆分少了 1
    return 'decomposition_error';
  }

  // 错误类型 2：忘记加剩数 - 只计算了凑十的部分
  // 例如：9+5，9+1=10，但忘记加剩下的 4，回答 10
  if (userAnswer === 10) {
    return 'step_missing';
  }

  // 错误类型 3：计算错误 - 10 加几算错
  // 例如：9+5，9+1=10 正确，但 10+4 算成 13 或 15
  const expectedAfterMake10 = 10 + (num2 - complementTo10);
  if (Math.abs(userAnswer - expectedAfterMake10) <= 2 && userAnswer !== correctAnswer) {
    return 'calculation_error';
  }

  // 其他情况归为计算错误
  return 'calculation_error';
};

/**
 * 生成唯一的错题 ID
 */
export const generateMistakeId = (): string => {
  return `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 生成错题记录
 */
export const createMistakeRecord = (
  expression: string,
  userAnswer: number,
  correctAnswer: number,
  errorType?: ErrorType
): MistakeRecord => {
  const detectedErrorType = errorType || analyzeErrorType(expression, userAnswer, correctAnswer);
  const today = getTodayString();

  return {
    id: generateMistakeId(),
    expression,
    userAnswer,
    correctAnswer,
    errorType: detectedErrorType,
    mistakeCount: 1,
    reviewCount: 0,
    correctCount: 0,
    lastReviewDate: null,
    nextReviewDate: getFutureDateString(REVIEW_INTERVALS[0]), // 第一次复习：1 天后
    createdAt: today,
    mastered: false
  };
};

/**
 * 从 Local Storage 加载错题本
 */
export const loadMistakeBook = (): MistakeRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('加载错题本失败:', error);
    return [];
  }
};

/**
 * 保存错题本到 Local Storage
 */
export const saveMistakeBook = (mistakes: MistakeRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
  } catch (error) {
    console.error('保存错题本失败:', error);
  }
};

/**
 * 捕获错题 - 当用户答错时调用
 *
 * @param expression 题目表达式
 * @param userAnswer 用户答案
 * @param correctAnswer 正确答案
 * @param existingMistakes 当前错题本
 * @returns 更新后的错题本
 */
export const captureMistake = (
  expression: string,
  userAnswer: number,
  correctAnswer: number,
  existingMistakes: MistakeRecord[] = []
): MistakeRecord[] => {
  // 查找是否已存在相同表达式的错题
  const existingIndex = existingMistakes.findIndex(
    m => m.expression === expression && !m.mastered
  );

  if (existingIndex >= 0) {
    // 更新现有错题
    const updated = [...existingMistakes];
    updated[existingIndex] = {
      ...updated[existingIndex],
      mistakeCount: updated[existingIndex].mistakeCount + 1,
      correctCount: 0, // 重置连续正确计数
      errorType: analyzeErrorType(expression, userAnswer, correctAnswer),
      nextReviewDate: getFutureDateString(REVIEW_INTERVALS[0]) // 重新从第 1 天开始
    };
    saveMistakeBook(updated);
    return updated;
  }

  // 创建新错题记录
  const newRecord = createMistakeRecord(expression, userAnswer, correctAnswer);
  const updated = [...existingMistakes, newRecord];
  saveMistakeBook(updated);
  return updated;
};

/**
 * 记录复习结果
 *
 * @param mistakeId 错题 ID
 * @param isCorrect 是否回答正确
 * @param existingMistakes 当前错题本
 * @returns 更新后的错题本
 */
export const recordReview = (
  mistakeId: string,
  isCorrect: boolean,
  existingMistakes: MistakeRecord[] = []
): MistakeRecord[] => {
  const index = existingMistakes.findIndex(m => m.id === mistakeId);
  if (index < 0) return existingMistakes;

  const mistake = existingMistakes[index];
  const updated = [...existingMistakes];

  if (isCorrect) {
    // 回答正确
    const newCorrectCount = mistake.correctCount + 1;
    const newReviewCount = mistake.reviewCount + 1;

    // 检查是否已掌握（复习 5 次且全对）
    const isMastered = newReviewCount >= REVIEW_INTERVALS.length && newCorrectCount >= REVIEW_INTERVALS.length;

    updated[index] = {
      ...mistake,
      reviewCount: newReviewCount,
      correctCount: newCorrectCount,
      lastReviewDate: getTodayString(),
      mastered: isMastered,
      // 如果已掌握，不再安排复习；否则安排下次复习
      nextReviewDate: isMastered
        ? mistake.nextReviewDate
        : getFutureDateString(REVIEW_INTERVALS[Math.min(newReviewCount, REVIEW_INTERVALS.length - 1)])
    };
  } else {
    // 回答错误 - 重置到第 1 天
    updated[index] = {
      ...mistake,
      correctCount: 0,
      mistakeCount: mistake.mistakeCount + 1,
      lastReviewDate: getTodayString(),
      nextReviewDate: getFutureDateString(REVIEW_INTERVALS[0])
    };
  }

  saveMistakeBook(updated);
  return updated;
};

/**
 * 获取待复习队列
 *
 * 返回今日需要复习的错题列表
 */
export const getReviewQueue = (existingMistakes: MistakeRecord[] = []): MistakeRecord[] => {
  const today = getTodayString();
  return existingMistakes
    .filter(m => !m.mastered && m.nextReviewDate <= today)
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
};

/**
 * 生成变式题
 *
 * 根据原题生成相似的变式题用于强化练习
 *
 * @param originalExpression 原题目
 * @returns 变式题表达式
 */
export const generateVariantQuestion = (originalExpression: string): string | null => {
  const match = originalExpression.match(/(\d+)\s*\+\s*(\d+)/);
  if (!match) return null;

  const num1 = parseInt(match[1], 10);
  const num2 = parseInt(match[2], 10);

  // 变式题生成策略：
  // 1. 保持大数不变，小数 +/-1
  // 2. 保持小数不变，大数 +/-1
  // 3. 同类型的其他题目

  const strategies = [
    () => `${num1} + ${Math.max(1, num2 - 1)}`, // 小数 -1
    () => `${num1} + ${num2 + 1}`, // 小数 +1
    () => `${Math.max(6, num1 - 1)} + ${num2}`, // 大数 -1（保持大数>=6）
    () => `${num1 + 1} + ${num2}`, // 大数 +1
  ];

  // 随机选择一个策略
  const strategy = strategies[Math.floor(Math.random() * strategies.length)];
  return strategy();
};

/**
 * 获取错题本统计信息
 */
export const getMistakeBookStats = (existingMistakes: MistakeRecord[] = []): MistakeBookStats => {
  const today = getTodayString();

  const stats: MistakeBookStats = {
    totalMistakes: existingMistakes.length,
    pendingReview: 0,
    masteredCount: 0,
    errorTypeDistribution: {
      decomposition_error: 0,
      calculation_error: 0,
      step_missing: 0,
      timeout: 0,
      unknown: 0
    },
    todayReviewCompleted: 0
  };

  for (const mistake of existingMistakes) {
    // 统计待复习
    if (!mistake.mastered && mistake.nextReviewDate <= today) {
      stats.pendingReview++;
    }

    // 统计已掌握
    if (mistake.mastered) {
      stats.masteredCount++;
    }

    // 统计错误类型分布
    stats.errorTypeDistribution[mistake.errorType]++;

    // 统计今日已完成复习
    if (mistake.lastReviewDate === today) {
      stats.todayReviewCompleted++;
    }
  }

  return stats;
};

/**
 * 清除已掌握的错题（可选功能）
 */
export const clearMasteredMistakes = (existingMistakes: MistakeRecord[] = []): MistakeRecord[] => {
  const filtered = existingMistakes.filter(m => !m.mastered);
  saveMistakeBook(filtered);
  return filtered;
};

/**
 * 导出错题本数据（用于备份或分析）
 */
export const exportMistakeBook = (): string => {
  const mistakes = loadMistakeBook();
  return JSON.stringify(mistakes, null, 2);
};

/**
 * 导入错题本数据（用于恢复）
 */
export const importMistakeBook = (data: string): boolean => {
  try {
    const mistakes = JSON.parse(data) as MistakeRecord[];
    saveMistakeBook(mistakes);
    return true;
  } catch (error) {
    console.error('导入错题本失败:', error);
    return false;
  }
};
