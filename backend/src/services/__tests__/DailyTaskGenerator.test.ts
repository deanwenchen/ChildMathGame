/**
 * DailyTaskGenerator 单元测试
 */

import dailyTaskGenerator from '../utils/DailyTaskGenerator';

describe('DailyTaskGenerator', () => {
  const generator = dailyTaskGenerator;

  describe('generateDailyQuestions', () => {
    test('应该生成 10 道题目', () => {
      const questions = generator.generateDailyQuestions('2024-01-15');
      expect(questions).toHaveLength(10);
    });

    test('同一日期应该生成相同的题目（种子一致性）', () => {
      const questions1 = generator.generateDailyQuestions('2024-01-15');
      const questions2 = generator.generateDailyQuestions('2024-01-15');

      expect(questions1).toEqual(questions2);
    });

    test('不同日期应该生成不同的题目', () => {
      const questions1 = generator.generateDailyQuestions('2024-01-15');
      const questions2 = generator.generateDailyQuestions('2024-01-16');

      expect(questions1).not.toEqual(questions2);
    });

    test('题目应该包含必要的字段', () => {
      const questions = generator.generateDailyQuestions('2024-01-15');

      questions.forEach(q => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('expression');
        expect(q).toHaveProperty('answer');
        expect(q).toHaveProperty('difficulty');
        expect(q).toHaveProperty('operationType');
      });
    });

    test('难度分布应该是 3 简单 +5 中等 +2 困难', () => {
      const questions = generator.generateDailyQuestions('2024-01-15');

      const easyCount = questions.filter(q => q.difficulty === 'easy').length;
      const mediumCount = questions.filter(q => q.difficulty === 'medium').length;
      const hardCount = questions.filter(q => q.difficulty === 'hard').length;

      expect(easyCount).toBe(3);
      expect(mediumCount).toBe(5);
      expect(hardCount).toBe(2);
    });

    test('应该覆盖四种运算类型', () => {
      const questions = generator.generateDailyQuestions('2024-01-15');

      const operationTypes = new Set(questions.map(q => q.operationType));

      expect(operationTypes.has('addition')).toBe(true);
      expect(operationTypes.has('subtraction')).toBe(true);
      expect(operationTypes.has('multiplication')).toBe(true);
      expect(operationTypes.has('division')).toBe(true);
    });

    test('减法题目的答案应该非负', () => {
      const questions = generator.generateDailyQuestions('2024-01-15');

      const subtractionQuestions = questions.filter(q => q.operationType === 'subtraction');

      subtractionQuestions.forEach(q => {
        expect(q.answer).toBeGreaterThanOrEqual(0);
      });
    });

    test('除法题目应该能整除', () => {
      const questions = generator.generateDailyQuestions('2024-01-15');

      const divisionQuestions = questions.filter(q => q.operationType === 'division');

      divisionQuestions.forEach(q => {
        expect(Number.isInteger(q.answer)).toBe(true);
      });
    });
  });

  describe('日期格式验证', () => {
    test('应该拒绝无效的日期格式', () => {
      expect(() => generator.generateDailyQuestions('2024/01/15')).toThrow('无效的日期格式');
      expect(() => generator.generateDailyQuestions('01-15-2024')).toThrow('无效的日期格式');
      expect(() => generator.generateDailyQuestions('2024-1-15')).toThrow('无效的日期格式');
    });

    test('应该拒绝不存在的日期', () => {
      expect(() => generator.generateDailyQuestions('2024-02-30')).toThrow('无效的日期格式');
      expect(() => generator.generateDailyQuestions('2024-13-01')).toThrow('无效的日期格式');
    });
  });

  describe('难度题目数值范围', () => {
    test('简单难度加法应该在 1-20 范围内', () => {
      for (let i = 0; i < 10; i++) {
        const questions = generator.generateDailyQuestions(`2024-01-${String(i + 1).padStart(2, '0')}`);
        const easyAdditions = questions.filter(
          q => q.difficulty === 'easy' && q.operationType === 'addition'
        );

        easyAdditions.forEach(q => {
          const parts = q.expression.split('+').map(p => parseInt(p.trim()));
          parts.forEach(p => {
            expect(p).toBeGreaterThanOrEqual(1);
            expect(p).toBeLessThanOrEqual(20);
          });
        });
      }
    });

    test('困难难度乘法应该使用较大的数字', () => {
      for (let i = 0; i < 10; i++) {
        const questions = generator.generateDailyQuestions(`2024-02-${String(i + 1).padStart(2, '0')}`);
        const hardMultiplications = questions.filter(
          q => q.difficulty === 'hard' && q.operationType === 'multiplication'
        );

        hardMultiplications.forEach(q => {
          const parts = q.expression.split('×').map(p => parseInt(p.trim()));
          expect(parts[0] >= 6 || parts[1] >= 6).toBe(true);
        });
      }
    });
  });
});
