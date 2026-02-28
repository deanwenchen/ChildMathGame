export type Difficulty = 'easy' | 'medium' | 'hard';
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface Question {
  id: string;
  expression: string;
  answer: number;
  difficulty: Difficulty;
  operationType: OperationType;
  options?: number[]; // 用于选择题模式
}

export interface QuestionConfig {
  difficulty: Difficulty;
  operationType: OperationType;
  min_value: number;
  max_value: number;
}

// 难度配置
const DIFFICULTY_CONFIG = {
  easy: {
    addition: { min: 1, max: 20 },
    subtraction: { min: 1, max: 20 },
    multiplication: { min: 1, max: 10 },
    division: { min: 1, max: 20 }
  },
  medium: {
    addition: { min: 10, max: 50 },
    subtraction: { min: 10, max: 50 },
    multiplication: { min: 5, max: 15 },
    division: { min: 10, max: 100 }
  },
  hard: {
    addition: { min: 50, max: 200 },
    subtraction: { min: 50, max: 200 },
    multiplication: { min: 10, max: 30 },
    division: { min: 50, max: 200 }
  }
};

export class ArithmeticQuestionGenerator {
  private static instance: ArithmeticQuestionGenerator;

  private constructor() {}

  public static getInstance(): ArithmeticQuestionGenerator {
    if (!ArithmeticQuestionGenerator.instance) {
      ArithmeticQuestionGenerator.instance = new ArithmeticQuestionGenerator();
    }
    return ArithmeticQuestionGenerator.instance;
  }

  generateQuestion(difficulty: Difficulty, operationType: OperationType): Question {
    const config = this.getConfig(difficulty, operationType);
    let a = this.randomInRange(config.min_value, config.max_value);
    let b = this.randomInRange(config.min_value, config.max_value);
    let answer: number;

    switch (operationType) {
      case 'addition':
        answer = a + b;
        break;

      case 'subtraction':
        // 确保结果非负
        if (a < b) [a, b] = [b, a];
        answer = a - b;
        break;

      case 'multiplication':
        answer = a * b;
        break;

      case 'division':
        // 生成能整除的题目
        // 确保被除数和除数都在指定范围内
        const minVal = config.min_value;
        const maxVal = config.max_value;

        // 生成除数（确保不为0）
        const divisor = this.randomInRange(minVal, maxVal);

        // 生成商，确保被除数不超过最大值
        const maxQuotient = Math.floor(maxVal / divisor);
        const minQuotient = Math.max(1, Math.ceil(minVal / divisor));

        if (minQuotient <= maxQuotient) {
          const quotient = this.randomInRange(minQuotient, maxQuotient);
          a = quotient * divisor;
          b = divisor;
          answer = quotient;
        } else {
          // 如果无法生成合适的商，使用简单的方式
          // 生成一个较小的商（1-3）
          const quotient = this.randomInRange(1, 3);
          // 调整除数确保被除数在范围内
          const adjustedDivisor = this.randomInRange(
            Math.ceil(minVal / quotient),
            Math.floor(maxVal / quotient)
          );
          a = quotient * adjustedDivisor;
          b = adjustedDivisor;
          answer = quotient;
        }
        break;

      default:
        throw new Error(`不支持的运算类型: ${operationType}`);
    }

    return {
      id: this.generateId(),
      expression: `${a} ${this.getOperator(operationType)} ${b}`,
      answer,
      difficulty,
      operationType
    };
  }

  private getConfig(difficulty: Difficulty, operationType: OperationType): QuestionConfig {
    const config = DIFFICULTY_CONFIG[difficulty][operationType];
    return {
      difficulty,
      operationType,
      min_value: config.min,
      max_value: config.max
    };
  }

  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getOperator(operationType: OperationType): string {
    const operators: Record<OperationType, string> = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷'
    };
    return operators[operationType];
  }

  private generateId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ArithmeticQuestionGenerator.getInstance();
