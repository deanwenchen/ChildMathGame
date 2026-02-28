import express from 'express';
import questionGenerator from '../services/QuestionGenerator.service';
import answerValidator from '../services/AnswerValidator.service';
import scoreCalculator from '../services/ScoreCalculator.service';

const router = express.Router();

// 生成题目
router.get('/', (req, res) => {
  try {
    const { difficulty, operation } = req.query;

    const validDifficulties = ['easy', 'medium', 'hard'];
    const validOperations = ['addition', 'subtraction', 'multiplication', 'division'];

    if (!difficulty || !validDifficulties.includes(difficulty as string)) {
      return res.status(400).json({ error: '无效的难度级别，请选择: easy, medium, hard' });
    }

    if (!operation || !validOperations.includes(operation as string)) {
      return res.status(400).json({ error: '无效的运算类型，请选择: addition, subtraction, multiplication, division' });
    }

    const question = questionGenerator.generateQuestion(
      difficulty as 'easy' | 'medium' | 'hard',
      operation as 'addition' | 'subtraction' | 'multiplication' | 'division'
    );

    res.json({
      question,
      message: '题目生成成功'
    });
  } catch (error) {
    console.error('生成题目失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 验证答案
router.post('/validate', (req, res) => {
  try {
    const { userAnswer, correctAnswer } = req.body;

    if (userAnswer === undefined || correctAnswer === undefined) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const isCorrect = answerValidator.validateAnswer(userAnswer, correctAnswer);

    const feedback = answerValidator.getFeedback(isCorrect, Number(userAnswer), correctAnswer);

    res.json({
      correct: isCorrect,
      feedback: feedback.message,
      type: feedback.type
    });
  } catch (error) {
    console.error('验证答案失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 计算分数
router.post('/calculate-score', (req, res) => {
  try {
    const { correctCount, totalCount, timeSpent, difficulty } = req.body;

    if (correctCount === undefined || totalCount === undefined || timeSpent === undefined || !difficulty) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const score = scoreCalculator.calculateScore(
      correctCount,
      totalCount,
      timeSpent,
      difficulty as 'easy' | 'medium' | 'hard'
    );

    const achievement = scoreCalculator.getAchievementLevel(score);

    res.json({
      score,
      achievement
    });
  } catch (error) {
    console.error('计算分数失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
