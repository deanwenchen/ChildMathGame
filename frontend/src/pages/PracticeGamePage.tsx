import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  IconButton,
  Grid,
  Chip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import { Question, Difficulty, OperationType, Feedback } from '../types';

const PracticeGamePage: React.FC = () => {
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10); // 每轮10题
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  // 从sessionStorage获取配置
  const config = JSON.parse(sessionStorage.getItem('practiceConfig') || '{}');
  const difficulty: Difficulty = config.difficulty || 'easy';
  const operation: OperationType = config.operation || 'addition';

  // 获取题目
  const fetchQuestion = async () => {
    try {
      const response = await axios.get('/questions', {
        params: { difficulty, operation }
      });
      setQuestion(response.data.question);
      setFeedback(null);
      setUserAnswer('');
      setIsAnswering(false);
    } catch (error) {
      console.error('获取题目失败:', error);
      setFeedback({
        message: '题目加载失败，请重试',
        type: 'error'
      });
    }
  };

  // 验证答案
  const checkAnswer = async () => {
    if (!question) return;

    setIsAnswering(true);

    try {
      const response = await axios.post('/questions/validate', {
        userAnswer: parseFloat(userAnswer),
        correctAnswer: question.answer
      });

      const isCorrect = response.data.correct;
      setFeedback({
        message: response.data.feedback,
        type: response.data.type
      });

      if (isCorrect) {
        setCorrectCount(prev => prev + 1);
      }

      // 延迟1.5秒后显示下一题或结束
      setTimeout(() => {
        if (questionNumber < totalQuestions) {
          setQuestionNumber(prev => prev + 1);
          fetchQuestion();
        } else {
          // 游戏结束
          setEndTime(Date.now());
          setGameCompleted(true);
        }
      }, 1500);
    } catch (error) {
      console.error('验证答案失败:', error);
      setFeedback({
        message: '验证失败，请重试',
        type: 'error'
      });
      setIsAnswering(false);
    }
  };

  // 计算分数
  const calculateScore = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await axios.post('/questions/calculate-score', {
        correctCount,
        totalCount: totalQuestions,
        timeSpent,
        difficulty
      });

      return {
        score: response.data.score,
        achievement: response.data.achievement
      };
    } catch (error) {
      console.error('计算分数失败:', error);
      return { score: 0, achievement: '💪 继续努力' };
    }
  };

  // 游戏结束处理
  const handleGameEnd = async () => {
    const result = await calculateScore();
    const timeSpent = Math.floor((endTime! - startTime) / 1000);

    // 保存到sessionStorage供成绩页面使用
    sessionStorage.setItem('gameResult', JSON.stringify({
      score: result.score,
      achievement: result.achievement,
      correctCount,
      totalQuestions,
      timeSpent,
      difficulty,
      operation
    }));

    navigate('/game-result');
  };

  // 初始化：获取第一题
  useEffect(() => {
    fetchQuestion();
  }, []);

  // 键盘事件：回车提交答案
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isAnswering && userAnswer.trim() !== '') {
        checkAnswer();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isAnswering, userAnswer]);

  // 游戏结束自动跳转
  useEffect(() => {
    if (gameCompleted) {
      handleGameEnd();
    }
  }, [gameCompleted]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ p: 3 }}>
        {/* 头部信息 */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/practice')}
            size="small"
            sx={{ mb: 2 }}
          >
            选择模式
          </Button>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Chip
                label={`第 ${questionNumber} / ${totalQuestions} 题`}
                color="primary"
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <Chip
                label={`难度: ${difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}`}
                color="secondary"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 进度条 */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={(questionNumber / totalQuestions) * 100}
            sx={{ borderRadius: 5, height: 8 }}
          />
        </Box>

        {/* 题目区域 */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          {question ? (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                bgcolor: 'background.default',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  fontSize: '2.5rem',
                  color: 'primary.main'
                }}
              >
                {question.expression} = ?
              </Typography>
            </Paper>
          ) : (
            <Typography>加载题目中...</Typography>
          )}
        </Box>

        {/* 答题区域 */}
        {!gameCompleted && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="large"
              placeholder="输入答案..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isAnswering}
              inputProps={{
                style: { fontSize: '1.5rem', textAlign: 'center' }
              }}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.5rem'
                }
              }}
            />
          </Box>
        )}

        {/* 反馈区域 */}
        {feedback && (
          <Alert
            severity={feedback.type === 'success' ? 'success' : 'error'}
            icon={feedback.type === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
            sx={{ mb: 2, fontSize: '1.1rem' }}
          >
            {feedback.message}
            {feedback.type === 'success' && question && (
              <Box component="span" sx={{ ml: 1, fontWeight: 'bold' }}>
                答案是: {question.answer}
              </Box>
            )}
          </Alert>
        )}

        {/* 提交按钮 */}
        {!gameCompleted && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={checkAnswer}
              disabled={isAnswering || userAnswer.trim() === ''}
              sx={{
                px: 8,
                py: 2,
                fontSize: '1.2rem',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                }
              }}
            >
              {isAnswering ? '验证中...' : '提交答案 ✅'}
            </Button>
          </Box>
        )}

        {/* 统计信息 */}
        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  已答对
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {correctCount}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  正确率
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {questionNumber > 1
                    ? Math.round((correctCount / (questionNumber - 1)) * 100) + '%'
                    : '-'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Container>
  );
};

export default PracticeGamePage;
