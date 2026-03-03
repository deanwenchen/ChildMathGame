import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  CuoshiQuestion,
  generateCuoshiQuestions,
  checkAnswer,
  calculateStars,
  getLevelInfo,
} from '@/utils/cuoshi';
import DecompositionBox from '@/components/cuoshi/DecompositionBox';
import CelebrationEffect from '@/components/animations/CelebrationEffect';

interface CuoshiGamePageProps {
  level: '9' | '8' | '7' | '6';
  onComplete: (level: '9' | '8' | '7' | '6', stars: number, correctCount: number) => void;
  onBack: () => void;
}

/**
 * 凑十法游戏页面
 *
 * 核心功能：
 * - 显示凑十分解框
 * - 用户输入答案
 * - 即时反馈（答对庆祝/答错解析）
 * - 连击系统
 * - 提示功能
 */
const CuoshiGamePage: React.FC<CuoshiGamePageProps> = ({ level, onComplete, onBack }) => {
  const levelInfo = getLevelInfo(level);

  // 游戏状态
  const [questions, setQuestions] = useState<CuoshiQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0); // 连击数
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 用户输入
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 倒计时状态
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdownValue, setCountdownValue] = useState(3);

  // 初始化题目
  useEffect(() => {
    const newQuestions = generateCuoshiQuestions(level, 10);
    setQuestions(newQuestions);
  }, [level]);

  // 答题前倒计时
  useEffect(() => {
    if (showCountdown && countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownValue === 0) {
      setShowCountdown(false);
    }
  }, [countdownValue, showCountdown]);

  // 键盘输入处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      setUserAnswer(e.key);
    } else if (e.key === 'Backspace') {
      setUserAnswer('');
    } else if (e.key === 'Enter' && userAnswer && !isSubmitting) {
      handleSubmit();
    }
  }, [userAnswer, isSubmitting]);

  // 提交答案
  const handleSubmit = async () => {
    if (!userAnswer || isSubmitting) return;

    setIsSubmitting(true);
    const answer = parseInt(userAnswer, 10);
    const question = questions[currentQuestionIndex];
    const result = checkAnswer(question, answer);

    if (result.isCorrect) {
      // 答对了
      setFeedback({ type: 'success', message: '太棒了！答对了！' });
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setShowAnswer(true);

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      // 答错了
      setFeedback({
        type: 'error',
        message: `答错了！正确答案是 ${result.correctAnswer}`,
      });
      setStreak(0);
      setShowAnswer(true);

      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }

    setIsSubmitting(false);
  };

  // 下一题
  const nextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      // 关卡完成
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
    setUserAnswer('');
    setShowAnswer(false);
    setFeedback(null);
    setShowCountdown(true);
    setCountdownValue(3);
  };

  // 关卡完成
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length - 1 && feedback) {
      // 所有题目已完成
      const stars = calculateStars(correctCount, questions.length);
      setTimeout(() => {
        onComplete(level, stars, correctCount);
      }, 1000);
    }
  }, [currentQuestionIndex, questions.length, feedback]);

  const currentQuestion = questions[currentQuestionIndex];

  // 渲染倒计时遮罩
  if (showCountdown) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <Typography
          sx={{
            fontSize: '8rem',
            color: 'white',
            fontWeight: 'bold',
            animation: 'countdownPulse 1s ease-in-out',
            '@keyframes countdownPulse': {
              '0%': { transform: 'scale(0.5)', opacity: 0 },
              '50%': { transform: 'scale(1.2)', opacity: 1 },
              '100%': { transform: 'scale(1)', opacity: 0.8 },
            },
          }}
        >
          {countdownValue}
        </Typography>
        <Typography sx={{ color: 'white', mt: 2, fontSize: '1.5rem' }}>
          准备好了吗？
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 3, color: 'white', borderColor: 'white' }}
          onClick={() => setShowCountdown(false)}
        >
          跳过倒计时
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
      {/* 答对庆祝动画 */}
      {feedback?.type === 'success' && <CelebrationEffect />}

      {/* 顶部导航 */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          返回关卡选择
        </Button>
      </Box>

      {/* 关卡信息 */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: levelInfo.color, color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {levelInfo.label}
            </Typography>
            <Typography variant="body2">
              第 {currentQuestionIndex + 1} 题 / 共 {questions.length} 题
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`答对：${correctCount}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
            />
            <Chip
              label={`连击：${streak}`}
              sx={{ bgcolor: streak >= 3 ? '#FFD700' : 'rgba(255,255,255,0.3)', color: streak >= 3 ? '#000' : 'white' }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 进度条 */}
      <Box sx={{ mb: 3 }}>
        <CircularProgress
          variant="determinate"
          value={((currentQuestionIndex + 1) / questions.length) * 100}
          size={10}
          sx={{ width: '100%', borderRadius: 5 }}
        />
      </Box>

      {/* 凑十分解框 */}
      {currentQuestion && (
        <DecompositionBox
          question={currentQuestion}
          showAnswer={showAnswer}
          highlightStep={showAnswer ? 3 : -1}
        />
      )}

      {/* 答题区域 */}
      <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          你的答案：
        </Typography>
        <TextField
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={handleKeyDown}
          type="number"
          variant="outlined"
          disabled={isSubmitting || showAnswer}
          sx={{
            width: 150,
            '& input': {
              textAlign: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
            },
          }}
        />

        {/* 提交按钮 */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!userAnswer || isSubmitting || showAnswer}
            sx={{ px: 6, py: 2, fontSize: '1.2rem' }}
          >
            提交答案
          </Button>
        </Box>

        {/* 反馈信息 */}
        {feedback && (
          <Alert
            severity={feedback.type}
            sx={{ mt: 3, fontSize: '1.2rem' }}
            icon={false}
          >
            <Typography variant="h6">{feedback.message}</Typography>
          </Alert>
        )}

        {/* 操作提示 */}
        {!feedback && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            💡 提示：可以直接按键盘数字键输入，按回车提交
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default CuoshiGamePage;
