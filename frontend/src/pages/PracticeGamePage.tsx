import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  LinearProgress,
  Alert,
  Grid,
  Chip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { Question, Difficulty, OperationType, Feedback } from '../types';
import { CelebrationEffect } from '../components/animations/CelebrationEffect';
import { ComboCounter } from '../components/animations/ComboCounter';
import { GameTimer } from '../components/animations/GameTimer';
import { AchievementToast } from '../components/animations/AchievementToast';
import { Achievement, checkAchievements, AchievementState } from '../utils/achievements';
import { useGame } from '../contexts/GameContext';
import useSound from '../hooks/useSound';

const PracticeGamePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    comboCount,
    resetCombo,
    incrementCombo,
    addAchievement,
    soundEnabled
  } = useGame();
  const sound = useSound();

  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const [showWrongFeedback, setShowWrongFeedback] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

  // 从 sessionStorage 获取配置
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
      setQuestionStartTime(Date.now());
      // 重置反馈显示状态
      setShowCorrectFeedback(false);
      setShowWrongFeedback(false);
      // 开始 3 秒倒计时
      setShowCountdown(true);
      setCountdownValue(3);
    } catch (error) {
      console.error('获取题目失败:', error);
      setFeedback({
        message: '题目加载失败，请重试',
        type: 'error'
      });
    }
  };

  // 处理成就解锁
  const handleAchievements = (isCorrect: boolean, questionTime: number) => {
    const achievementState: AchievementState = {
      currentStreak: isCorrect ? currentStreak + 1 : 0,
      maxStreak: Math.max(currentStreak, isCorrect ? currentStreak + 1 : 0),
      correctCount: isCorrect ? correctCount + 1 : correctCount,
      totalQuestions: questionNumber,
      questionTime,
      isPerfectGame: false // 游戏结束时再判断
    };

    const newAchievements = checkAchievements(achievementState, unlockedAchievementIds);

    newAchievements.forEach(achievement => {
      setUnlockedAchievementIds(prev => [...prev, achievement.id]);
      addAchievement(achievement);
      setCurrentAchievement(achievement);
      setShowAchievement(true);

      // 播放成就解锁音效
      if (soundEnabled) {
        sound.playAchievement();
      }
    });
  };

  // 验证答案
  const checkAnswer = async () => {
    if (!question) return;

    setIsAnswering(true);
    const questionTime = (Date.now() - questionStartTime) / 1000;

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

      // 显示反馈动画
      if (isCorrect) {
        setShowCorrectFeedback(true);
        setTimeout(() => setShowCorrectFeedback(false), 1000);

        setCorrectCount(prev => prev + 1);
        setCurrentStreak(prev => prev + 1);
        incrementCombo();
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1500);

        // 播放音效
        if (soundEnabled) {
          sound.playCorrect();
          if (currentStreak + 1 >= 2) {
            sound.playCombo(Math.min(currentStreak + 1, 10));
          }
        }

        // 检查成就
        handleAchievements(true, questionTime);
      } else {
        setShowWrongFeedback(true);
        setTimeout(() => setShowWrongFeedback(false), 1000);

        setCurrentStreak(0);
        resetCombo();

        // 播放答错音效
        if (soundEnabled) {
          sound.playWrong();
        }
      }

      // 延迟 1.5 秒后显示下一题或结束
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

    // 检查完美游戏成就
    if (correctCount === totalQuestions) {
      const perfectAchievement: Achievement = {
        id: 'perfect_game',
        name: '完美表现',
        description: '10 题全对',
        icon: '🏆',
        condition: () => true
      };

      if (!unlockedAchievementIds.includes('perfect_game')) {
        addAchievement(perfectAchievement);
        setCurrentAchievement(perfectAchievement);
        setShowAchievement(true);

        // 播放庆祝音效
        if (soundEnabled) {
          sound.playCelebrate();
        }
      }
    }

    // 保存到 sessionStorage 供成绩页面使用
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

  // 倒计时逻辑
  useEffect(() => {
    if (showCountdown && countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdownValue === 0) {
      setShowCountdown(false);
    }
  }, [showCountdown, countdownValue]);

  // 键盘事件：回车提交答案，数字键快速输入
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 回车提交
      if (e.key === 'Enter' && !isAnswering && userAnswer.trim() !== '') {
        checkAnswer();
      }

      // 数字键快速输入（0-9 和小数点）
      if (!isAnswering && !showCountdown && question) {
        if (/^[0-9]$/.test(e.key) || (e.key === '.' && !userAnswer.includes('.'))) {
          // 如果已经有答案，自动替换；否则追加
          setUserAnswer(e.key);
          e.preventDefault();
        }
        // 退格键删除最后一个数字
        if (e.key === 'Backspace' && userAnswer.length > 0) {
          setUserAnswer(prev => prev.slice(0, -1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnswering, userAnswer, showCountdown, question]);

  // 游戏结束自动跳转
  useEffect(() => {
    if (gameCompleted) {
      handleGameEnd();
    }
  }, [gameCompleted]);

  // 计时器超时处理
  const handleTimeout = () => {
    // 时间到，自动判错并进入下一题
    setIsAnswering(true);
    setFeedback({
      message: '时间到了！我们来看看答案吧',
      type: 'error'
    });
    setShowWrongFeedback(true);
    setTimeout(() => setShowWrongFeedback(false), 1000);
    setCurrentStreak(0);
    resetCombo();

    setTimeout(() => {
      if (questionNumber < totalQuestions) {
        setQuestionNumber(prev => prev + 1);
        fetchQuestion();
      } else {
        setEndTime(Date.now());
        setGameCompleted(true);
      }
    }, 2000);
  };

  // 跳过题目处理
  const handleSkip = () => {
    if (!question) return;

    setIsAnswering(true);
    setFeedback({
      message: `跳过啦～正确答案是 ${question.answer}`,
      type: 'error'
    });

    // 跳过不中断连击
    // 可以将跳过的题目记录到错题本（后续实现）

    setTimeout(() => {
      if (questionNumber < totalQuestions) {
        setQuestionNumber(prev => prev + 1);
        fetchQuestion();
      } else {
        setEndTime(Date.now());
        setGameCompleted(true);
      }
    }, 2000);
  };

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
            <Grid item xs={12} sm={8}>
              <Chip
                label={`第 ${questionNumber} / ${totalQuestions} 题`}
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              <Chip
                label={`难度：${difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}`}
                color="secondary"
                sx={{ mr: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              {/* 计时器 */}
              {!gameCompleted && !isAnswering && (
                <GameTimer totalTime={30} onTimeout={handleTimeout} />
              )}
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

        {/* 题目区域 - 添加答对/答错动画效果 */}
        <Box
          sx={{
            mb: 3,
            textAlign: 'center',
            animation: showCorrectFeedback ? 'correctPulse 0.5s ease-out' : showWrongFeedback ? 'wrongShake 0.5s ease-out' : 'none',
            '@keyframes correctPulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            },
            '@keyframes wrongShake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '20%': { transform: 'translateX(-10px)' },
              '40%': { transform: 'translateX(10px)' },
              '60%': { transform: 'translateX(-10px)' },
              '80%': { transform: 'translateX(10px)' }
            }
          }}
        >
          {question ? (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                bgcolor: showCorrectFeedback ? 'success.light' : showWrongFeedback ? 'error.light' : 'background.default',
                borderRadius: 2,
                transition: 'background-color 0.3s ease'
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  fontSize: '2.5rem',
                  color: showCorrectFeedback ? 'success.contrastText' : showWrongFeedback ? 'error.contrastText' : 'primary.main'
                }}
              >
                {question.expression} = ?
              </Typography>
            </Paper>
          ) : (
            <Typography>加载题目中...</Typography>
          )}
        </Box>

        {/* 倒计时覆盖层 */}
        {showCountdown && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={() => setShowCountdown(false)}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: '10rem',
                fontWeight: 'bold',
                color: 'white',
                animation: 'countdownPulse 1s ease-in-out',
                '@keyframes countdownPulse': {
                  '0%': { transform: 'scale(0.5)', opacity: 0 },
                  '50%': { transform: 'scale(1.2)', opacity: 1 },
                  '100%': { transform: 'scale(1)', opacity: 1 }
                }
              }}
            >
              {countdownValue}
            </Typography>
          </Box>
        )}

        {/* 答题区域 */}
        {!gameCompleted && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="输入答案..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isAnswering || showCountdown}
              inputProps={{
                style: { fontSize: '1.5rem', textAlign: 'center' }
              }}
              autoFocus={!showCountdown}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.5rem'
                },
                '& .MuiOutlinedInput-input': {
                  padding: '16px 14px'
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
                答案是：{question.answer}
              </Box>
            )}
            {feedback.type === 'error' && question && (
              <Box component="span" sx={{ ml: 1, fontWeight: 'bold' }}>
                正确答案是：{question.answer}
              </Box>
            )}
          </Alert>
        )}

        {/* 提交按钮 */}
        {!gameCompleted && (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handleSkip}
                disabled={isAnswering || showCountdown}
                startIcon={<SkipNextIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  '&:disabled': {
                    color: 'grey.400',
                  }
                }}
              >
                跳过
              </Button>
              <Button
                variant="contained"
                onClick={checkAnswer}
                disabled={isAnswering || userAnswer.trim() === ''}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
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

      {/* 庆祝动画 */}
      <CelebrationEffect trigger={showCelebration} intensity="medium" />

      {/* 连击计数器 */}
      <ComboCounter combo={comboCount} show={comboCount >= 2} />

      {/* 成就通知 */}
      <AchievementToast
        achievement={currentAchievement}
        open={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
    </Container>
  );
};

export default PracticeGamePage;
