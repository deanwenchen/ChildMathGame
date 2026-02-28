import questionGenerator from '../QuestionGenerator.service';
import { Difficulty, OperationType } from '../QuestionGenerator.service';

describe('ArithmeticQuestionGenerator', () => {
  // 测试加法运算
  describe('addition', () => {
    test('should generate addition questions with correct answer', () => {
      const question = questionGenerator.generateQuestion('easy', 'addition');

      expect(question.operationType).toBe('addition');
      expect(question.difficulty).toBe('easy');
      expect(typeof question.answer).toBe('number');
      expect(question.expression).toMatch(/\d+ \+ \d+/);

      // 验证答案正确性
      const [a, b] = question.expression.split(' + ').map(Number);
      expect(a + b).toBe(question.answer);
    });

    test('should respect difficulty ranges for addition', () => {
      // 简单难度：1-20
      const easyQuestion = questionGenerator.generateQuestion('easy', 'addition');
      const [easyA, easyB] = easyQuestion.expression.split(' + ').map(Number);
      expect(easyA).toBeGreaterThanOrEqual(1);
      expect(easyA).toBeLessThanOrEqual(20);
      expect(easyB).toBeGreaterThanOrEqual(1);
      expect(easyB).toBeLessThanOrEqual(20);

      // 中等难度：10-50
      const mediumQuestion = questionGenerator.generateQuestion('medium', 'addition');
      const [mediumA, mediumB] = mediumQuestion.expression.split(' + ').map(Number);
      expect(mediumA).toBeGreaterThanOrEqual(10);
      expect(mediumA).toBeLessThanOrEqual(50);
      expect(mediumB).toBeGreaterThanOrEqual(10);
      expect(mediumB).toBeLessThanOrEqual(50);

      // 困难难度：50-200
      const hardQuestion = questionGenerator.generateQuestion('hard', 'addition');
      const [hardA, hardB] = hardQuestion.expression.split(' + ').map(Number);
      expect(hardA).toBeGreaterThanOrEqual(50);
      expect(hardA).toBeLessThanOrEqual(200);
      expect(hardB).toBeGreaterThanOrEqual(50);
      expect(hardB).toBeLessThanOrEqual(200);
    });
  });

  // 测试减法运算
  describe('subtraction', () => {
    test('should generate subtraction questions with non-negative results', () => {
      const question = questionGenerator.generateQuestion('easy', 'subtraction');

      expect(question.operationType).toBe('subtraction');
      expect(question.difficulty).toBe('easy');
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.expression).toMatch(/\d+ - \d+/);

      // 验证答案正确性且结果非负
      const [a, b] = question.expression.split(' - ').map(Number);
      expect(a - b).toBe(question.answer);
      expect(a).toBeGreaterThanOrEqual(b); // 确保第一个数 >= 第二个数
    });

    test('should respect difficulty ranges for subtraction', () => {
      // 简单难度：1-20
      const easyQuestion = questionGenerator.generateQuestion('easy', 'subtraction');
      const [easyA, easyB] = easyQuestion.expression.split(' - ').map(Number);
      expect(easyA).toBeGreaterThanOrEqual(1);
      expect(easyA).toBeLessThanOrEqual(20);
      expect(easyB).toBeGreaterThanOrEqual(1);
      expect(easyB).toBeLessThanOrEqual(20);

      // 中等难度：10-50
      const mediumQuestion = questionGenerator.generateQuestion('medium', 'subtraction');
      const [mediumA, mediumB] = mediumQuestion.expression.split(' - ').map(Number);
      expect(mediumA).toBeGreaterThanOrEqual(10);
      expect(mediumA).toBeLessThanOrEqual(50);
      expect(mediumB).toBeGreaterThanOrEqual(10);
      expect(mediumB).toBeLessThanOrEqual(50);

      // 困难难度：50-200
      const hardQuestion = questionGenerator.generateQuestion('hard', 'subtraction');
      const [hardA, hardB] = hardQuestion.expression.split(' - ').map(Number);
      expect(hardA).toBeGreaterThanOrEqual(50);
      expect(hardA).toBeLessThanOrEqual(200);
      expect(hardB).toBeGreaterThanOrEqual(50);
      expect(hardB).toBeLessThanOrEqual(200);
    });
  });

  // 测试乘法运算
  describe('multiplication', () => {
    test('should generate multiplication questions with correct answer', () => {
      const question = questionGenerator.generateQuestion('easy', 'multiplication');

      expect(question.operationType).toBe('multiplication');
      expect(question.difficulty).toBe('easy');
      expect(typeof question.answer).toBe('number');
      expect(question.expression).toMatch(/\d+ × \d+/);

      // 验证答案正确性
      const [a, b] = question.expression.split(' × ').map(Number);
      expect(a * b).toBe(question.answer);
    });

    test('should respect difficulty ranges for multiplication', () => {
      // 简单难度：1-10
      const easyQuestion = questionGenerator.generateQuestion('easy', 'multiplication');
      const [easyA, easyB] = easyQuestion.expression.split(' × ').map(Number);
      expect(easyA).toBeGreaterThanOrEqual(1);
      expect(easyA).toBeLessThanOrEqual(10);
      expect(easyB).toBeGreaterThanOrEqual(1);
      expect(easyB).toBeLessThanOrEqual(10);

      // 中等难度：5-15
      const mediumQuestion = questionGenerator.generateQuestion('medium', 'multiplication');
      const [mediumA, mediumB] = mediumQuestion.expression.split(' × ').map(Number);
      expect(mediumA).toBeGreaterThanOrEqual(5);
      expect(mediumA).toBeLessThanOrEqual(15);
      expect(mediumB).toBeGreaterThanOrEqual(5);
      expect(mediumB).toBeLessThanOrEqual(15);

      // 困难难度：10-30
      const hardQuestion = questionGenerator.generateQuestion('hard', 'multiplication');
      const [hardA, hardB] = hardQuestion.expression.split(' × ').map(Number);
      expect(hardA).toBeGreaterThanOrEqual(10);
      expect(hardA).toBeLessThanOrEqual(30);
      expect(hardB).toBeGreaterThanOrEqual(10);
      expect(hardB).toBeLessThanOrEqual(30);
    });
  });

  // 测试除法运算
  describe('division', () => {
    test('should generate division questions with integer results', () => {
      const question = questionGenerator.generateQuestion('easy', 'division');

      expect(question.operationType).toBe('division');
      expect(question.difficulty).toBe('easy');
      expect(Number.isInteger(question.answer)).toBe(true);
      expect(question.expression).toMatch(/\d+ ÷ \d+/);

      // 验证答案正确性且结果为整数
      const [dividend, divisor] = question.expression.split(' ÷ ').map(Number);
      expect(dividend / divisor).toBe(question.answer);
      expect(dividend % divisor).toBe(0); // 确保能整除
    });

    test('should respect difficulty ranges for division', () => {
      // 简单难度：1-20
      const easyQuestion = questionGenerator.generateQuestion('easy', 'division');
      const [easyDividend, easyDivisor] = easyQuestion.expression.split(' ÷ ').map(Number);
      expect(easyDividend).toBeGreaterThanOrEqual(1);
      expect(easyDividend).toBeLessThanOrEqual(20);
      expect(easyDivisor).toBeGreaterThanOrEqual(1);
      expect(easyDivisor).toBeLessThanOrEqual(20);

      // 中等难度：10-100
      const mediumQuestion = questionGenerator.generateQuestion('medium', 'division');
      const [mediumDividend, mediumDivisor] = mediumQuestion.expression.split(' ÷ ').map(Number);
      expect(mediumDividend).toBeGreaterThanOrEqual(10);
      expect(mediumDividend).toBeLessThanOrEqual(100);
      expect(mediumDivisor).toBeGreaterThanOrEqual(10);
      expect(mediumDivisor).toBeLessThanOrEqual(100);

      // 困难难度：50-200
      const hardQuestion = questionGenerator.generateQuestion('hard', 'division');
      const [hardDividend, hardDivisor] = hardQuestion.expression.split(' ÷ ').map(Number);
      expect(hardDividend).toBeGreaterThanOrEqual(50);
      expect(hardDividend).toBeLessThanOrEqual(200);
      expect(hardDivisor).toBeGreaterThanOrEqual(50);
      expect(hardDivisor).toBeLessThanOrEqual(200);
    });
  });

  // 测试错误处理
  describe('error handling', () => {
    test('should throw error for invalid operation type', () => {
      expect(() => {
        // @ts-ignore - 测试无效输入
        questionGenerator.generateQuestion('easy', 'invalid' as OperationType);
      }).toThrow();
    });

    test('should throw error for invalid difficulty', () => {
      expect(() => {
        // @ts-ignore - 测试无效输入
        questionGenerator.generateQuestion('invalid' as Difficulty, 'addition');
      }).toThrow();
    });
  });

  // 测试题目ID生成
  describe('question id', () => {
    test('should generate unique question ids', () => {
      const question1 = questionGenerator.generateQuestion('easy', 'addition');
      const question2 = questionGenerator.generateQuestion('easy', 'addition');

      expect(question1.id).toBeDefined();
      expect(question2.id).toBeDefined();
      expect(question1.id).not.toBe(question2.id);
    });
  });

  // 测试边界条件
  describe('edge cases', () => {
    test('should handle minimum values correctly', () => {
      // 生成多个题目确保覆盖边界情况
      for (let i = 0; i < 100; i++) {
        const question = questionGenerator.generateQuestion('easy', 'addition');
        const [a, b] = question.expression.split(' + ').map(Number);
        expect(a).toBeGreaterThanOrEqual(1);
        expect(b).toBeGreaterThanOrEqual(1);
      }
    });

    test('should handle maximum values correctly', () => {
      // 生成多个题目确保覆盖边界情况
      for (let i = 0; i < 100; i++) {
        const question = questionGenerator.generateQuestion('hard', 'multiplication');
        const [a, b] = question.expression.split(' × ').map(Number);
        expect(a).toBeLessThanOrEqual(30);
        expect(b).toBeLessThanOrEqual(30);
      }
    });
  });
});