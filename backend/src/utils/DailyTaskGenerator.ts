/**
 * 每日挑战题目生成器
 *
 * 使用日期作为种子，确保全服同一日期的题目完全一致
 * 题目难度分布：简单 3 题 + 中等 5 题 + 困难 2 题 = 共 10 题
 */

import { Question, Difficulty, OperationType } from '../services/QuestionGenerator.service';

/**
 * 种子随机数生成器
 * 使用 mulberry32 算法生成可重复的伪随机数
 */
class SeededRandom {
  private seed: number;

  constructor(seedString: string) {
    // 将字符串种子转换为数字种子
    this.seed = this.hashString(seedString);
  }

  /**
   * 字符串哈希函数（FNV-1a 算法）
   */
  private hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0; // 确保为无符号 32 位整数
  }

  /**
   * 生成 0-1 之间的随机数
   */
  next(): number {
    // mulberry32 算法
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * 生成指定范围内的随机整数
   */
  nextInRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * 从数组中随机选择一个元素
   */
  pickFromArray<T>(array: T[]): T {
    return array[this.nextInRange(0, array.length - 1)];
  }

  /**
   * 打乱数组（Fisher-Yates 洗牌算法）
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInRange(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * 难度配置
 */
const DIFFICULTY_DISTRIBUTION = [
  'easy', 'easy', 'easy',           // 3 题简单
  'medium', 'medium', 'medium', 'medium', 'medium', // 5 题中等
  'hard', 'hard'                    // 2 题困难
] as const;

/**
 * 运算类型配置
 */
const OPERATION_TYPES: OperationType[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division'
];

/**
 * 每日挑战题目生成器类
 */
export class DailyTaskGenerator {
  /**
   * 验证日期格式 (YYYY-MM-DD)
   */
  private isValidDate(date: string): boolean {
    // 检查格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }

    // 检查是否为有效日期
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return false;
    }

    // 确保日期没有溢出（例如 2024-02-30）
    const [year, month, day] = date.split('-').map(Number);
    return (
      parsed.getFullYear() === year &&
      parsed.getMonth() + 1 === month &&
      parsed.getDate() === day
    );
  }

  /**
   * 生成指定日期的 10 道挑战题目
   * @param date 日期字符串 (YYYY-MM-DD)
   * @returns Question[] 题目数组
   */
  generateDailyQuestions(date: string): Question[] {
    if (!this.isValidDate(date)) {
      throw new Error(`无效的日期格式：${date}，请使用 YYYY-MM-DD 格式`);
    }

    // 使用日期作为种子初始化随机数生成器
    const random = new SeededRandom(date);

    // 打乱难度顺序，避免总是简单->中等->困难
    const shuffledDifficulties = random.shuffle([...DIFFICULTY_DISTRIBUTION]);

    // 生成题目
    const questions: Question[] = [];
    const operationIndex = 0;

    for (let i = 0; i < 10; i++) {
      const difficulty = shuffledDifficulties[i];
      // 轮换运算类型，确保覆盖四则运算
      const operationType = OPERATION_TYPES[i % 4];

      const question = this.generateQuestion(random, difficulty, operationType);
      questions.push(question);
    }

    return questions;
  }

  /**
   * 生成单道题目
   */
  private generateQuestion(
    random: SeededRandom,
    difficulty: Difficulty,
    operationType: OperationType
  ): Question {
    const config = this.getDifficultyConfig(difficulty, operationType);
    let a: number;
    let b: number;
    let answer: number;

    switch (operationType) {
      case 'addition':
        a = random.nextInRange(config.min, config.max);
        b = random.nextInRange(config.min, config.max);
        answer = a + b;
        break;

      case 'subtraction':
        a = random.nextInRange(config.min, config.max);
        b = random.nextInRange(config.min, config.max);
        // 确保结果非负
        if (a < b) [a, b] = [b, a];
        answer = a - b;
        break;

      case 'multiplication':
        a = random.nextInRange(config.minMul, config.maxMul);
        b = random.nextInRange(config.minMul, config.maxMul);
        answer = a * b;
        break;

      case 'division':
        // 生成能整除的题目
        const divisor = random.nextInRange(config.minDiv, config.maxDiv);
        const maxQuotient = Math.floor(config.maxDivResult / divisor);
        const minQuotient = Math.max(1, Math.ceil(config.minDivResult / divisor));

        let quotient: number;
        if (minQuotient <= maxQuotient) {
          quotient = random.nextInRange(minQuotient, maxQuotient);
        } else {
          quotient = random.nextInRange(1, 3);
        }

        a = quotient * divisor;
        b = divisor;
        answer = quotient;
        break;

      default:
        throw new Error(`不支持的运算类型：${operationType}`);
    }

    return {
      id: `daily_${random.next().toString(36).substr(2, 8)}`,
      expression: `${a} ${this.getOperator(operationType)} ${b}`,
      answer,
      difficulty,
      operationType
    };
  }

  /**
   * 获取难度和运算类型对应的数值配置
   */
  private getDifficultyConfig(
    difficulty: Difficulty,
    operationType: OperationType
  ): {
    min: number;
    max: number;
    minMul: number;
    maxMul: number;
    minDiv: number;
    maxDiv: number;
    minDivResult: number;
    maxDivResult: number;
  } {
    const configs = {
      easy: {
        addition: { min: 1, max: 20 },
        subtraction: { min: 1, max: 20 },
        multiplication: { min: 1, max: 5 },
        division: { min: 2, max: 10, minResult: 1, maxResult: 10 }
      },
      medium: {
        addition: { min: 10, max: 50 },
        subtraction: { min: 10, max: 50 },
        multiplication: { min: 3, max: 10 },
        division: { min: 3, max: 15, minResult: 2, maxResult: 15 }
      },
      hard: {
        addition: { min: 50, max: 200 },
        subtraction: { min: 50, max: 200 },
        multiplication: { min: 6, max: 15 },
        division: { min: 5, max: 20, minResult: 3, maxResult: 20 }
      }
    };

    const config = configs[difficulty][operationType];
    return {
      min: config.min,
      max: config.max,
      minMul: config.min,
      maxMul: config.max,
      minDiv: 'minDiv' in config ? config.minDiv : config.min,
      maxDiv: 'maxDiv' in config ? config.maxDiv : config.max,
      minDivResult: 'minResult' in config ? config.minResult : config.min,
      maxDivResult: 'maxResult' in config ? config.maxResult : config.max
    };
  }

  /**
   * 获取运算符符号
   */
  private getOperator(operationType: OperationType): string {
    const operators: Record<OperationType, string> = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷'
    };
    return operators[operationType];
  }
}

export default new DailyTaskGenerator();
