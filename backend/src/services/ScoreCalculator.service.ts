import { Difficulty } from './QuestionGenerator.service';

export class ScoreCalculator {
  private static instance: ScoreCalculator;

  private constructor() {}

  public static getInstance(): ScoreCalculator {
    if (!ScoreCalculator.instance) {
      ScoreCalculator.instance = new ScoreCalculator();
    }
    return ScoreCalculator.instance;
  }

  calculateScore(
    correctCount: number,
    totalCount: number,
    timeSpent: number,
    difficulty: Difficulty
  ): number {
    // 基础得分：正确率 * 100
    const baseScore = (correctCount / totalCount) * 100;

    // 难度加成
    const difficultyBonus = this.getDifficultyBonus(difficulty);

    // 时间奖励：根据平均答题时间计算
    const timeBonus = this.calculateTimeBonus(timeSpent, totalCount, difficulty);

    // 总分 = 基础分 + 难度加成 + 时间奖励，最大100分
    const totalScore = Math.min(100, baseScore + difficultyBonus + timeBonus);

    return Math.round(totalScore);
  }

  private getDifficultyBonus(difficulty: Difficulty): number {
    const bonuses: Record<Difficulty, number> = {
      easy: 0,
      medium: 5,
      hard: 10
    };
    return bonuses[difficulty];
  }

  private calculateTimeBonus(timeSpent: number, questionCount: number, difficulty: Difficulty): number {
    const avgTimePerQuestion = timeSpent / questionCount;

    // 目标时间（秒）：根据难度设定合理目标
    const targetTimes: Record<Difficulty, number> = {
      easy: 8,
      medium: 12,
      hard: 15
    };

    const targetTime = targetTimes[difficulty];

    // 如果平均答题时间小于目标时间，给予奖励
    if (avgTimePerQuestion < targetTime) {
      // 每快1秒奖励2分，最大奖励20分
      const bonus = Math.min(20, (targetTime - avgTimePerQuestion) * 2);
      return bonus;
    }

    return 0;
  }

  getAchievementLevel(score: number): string {
    if (score >= 90) return '🌟 算术大师';
    if (score >= 80) return '⭐ 算术高手';
    if (score >= 70) return '👍 算术能手';
    if (score >= 60) return '😊 进步中';
    return '💪 继续努力';
  }
}

export default ScoreCalculator.getInstance();
