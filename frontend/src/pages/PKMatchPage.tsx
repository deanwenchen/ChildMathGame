import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  SportsKabaddi as PKIcon,
  Timer as TimerIcon,
  CheckCircle as CorrectIcon,
  Cancel as WrongIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { PKMatch, PKQuestion, PKMatchStatus } from '../types/social';

// 模拟生成题目
const generateQuestions = (count: number): PKQuestion[] => {
  const questions: PKQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const answer = a + b;
    const options = [answer];
    while (options.length < 10) {
      const wrong = answer + Math.floor(Math.random() * 10) - 5;
      if (wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    questions.push({
      id: `q${i}`,
      expression: `${a} + ${b} = ?`,
      answer,
      options: options.sort(() => Math.random() - 0.5).slice(0, 10),
    });
  }
  return questions;
};

// 模拟匹配
const mockMatchmaking = (): Promise<{ opponent: { id: number; username: string } }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        opponent: {
          id: 999,
          username: ['小明', '小红', '小刚', '小华'][Math.floor(Math.random() * 4)],
        },
      });
    }, 2000 + Math.random() * 2000);
  });
};

/**
 * PK对战页面
 */
const PKMatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useGame();

  const [matchStatus, setMatchStatus] = useState<PKMatchStatus>('waiting');
  const [match, setMatch] = useState<PKMatch | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PKQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0);

  // 匹配计时器
  useEffect(() => {
    if (matchStatus === 'waiting') {
      const timer = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [matchStatus]);

  // 答题倒计时
  useEffect(() => {
    if (matchStatus === 'playing' && timeLeft > 0 && !selectedAnswer) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !selectedAnswer) {
      // 超时，自动跳到下一题
      handleNextRound(false);
    }
  }, [matchStatus, timeLeft, selectedAnswer]);

  // 模拟对手答题
  useEffect(() => {
    if (matchStatus === 'playing' && currentQuestion && !opponentAnswered) {
      const delay = 3000 + Math.random() * 8000;
      const timer = setTimeout(() => {
        setOpponentAnswered(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [matchStatus, currentQuestion, opponentAnswered]);

  // 开始匹配
  const startMatchmaking = async () => {
    setMatchStatus('waiting');
    setWaitingTime(0);

    try {
      const { opponent } = await mockMatchmaking();
      const questions = generateQuestions(10);

      setMatch({
        id: 1,
        roomCode: 'ROOM' + Date.now(),
        status: 'playing',
        player1: {
          id: currentUser!.id,
          username: currentUser!.username,
          avatar: 'avatar_me',
          status: 'in_game',
          totalPoints: 520,
          currentStreak: 5,
          todayCorrect: 12,
        },
        player2: {
          id: opponent.id,
          username: opponent.username,
          avatar: 'avatar_opponent',
          status: 'in_game',
          totalPoints: 480,
          currentStreak: 4,
          todayCorrect: 10,
        },
        currentRound: 1,
        totalRounds: 10,
        myScore: 0,
        opponentScore: 0,
        myCorrect: 0,
        opponentCorrect: 0,
        questions,
        createdAt: new Date().toISOString(),
      });

      setMatchStatus('matched');

      // 3秒后开始游戏
      setTimeout(() => {
        setMatchStatus('playing');
        setCurrentQuestion(questions[0]);
        setTimeLeft(15);
        setOpponentAnswered(false);
      }, 3000);
    } catch (error) {
      console.error('匹配失败:', error);
      setMatchStatus('waiting');
    }
  };

  // 取消匹配
  const cancelMatchmaking = () => {
    setMatchStatus('waiting');
    setWaitingTime(0);
    navigate('/home');
  };

  // 选择答案
  const selectAnswer = (answer: number) => {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.answer;

    if (isCorrect) {
      setAnswerResult('correct');
      setMatch((prev: PKMatch | null) => prev ? {
        ...prev,
        myScore: prev.myScore + 10,
        myCorrect: prev.myCorrect + 1,
      } : null);
    } else {
      setAnswerResult('wrong');
    }

    // 1.5秒后进入下一题
    setTimeout(() => {
      handleNextRound(isCorrect);
    }, 1500);
  };

  // 进入下一回合
  const handleNextRound = (_wasCorrect: boolean) => {
    if (!match) return;

    const nextRound = match.currentRound + 1;

    if (nextRound > match.totalRounds) {
      // 游戏结束
      endMatch();
    } else {
      // 下一题
      setMatch((prev: PKMatch | null) => prev ? { ...prev, currentRound: nextRound } : null);
      setCurrentQuestion(match.questions[nextRound - 1]);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTimeLeft(15);
      setOpponentAnswered(false);

      // 模拟对手得分
      if (Math.random() > 0.3) {
        setMatch((prev: PKMatch | null) => prev ? {
          ...prev,
          opponentScore: prev.opponentScore + 10,
          opponentCorrect: prev.opponentCorrect + 1,
        } : null);
      }
    }
  };

  // 结束游戏
  const endMatch = () => {
    setMatchStatus('completed');
    if (match) {
      setMatch((prev: PKMatch | null) => prev ? {
        ...prev,
        status: 'completed',
        winnerId: prev.myScore > prev.opponentScore ? prev.player1.id :
                  (prev.myScore < prev.opponentScore && prev.player2) ? prev.player2.id : undefined,
        endedAt: new Date().toISOString(),
      } : null);
    }
  };

  // 再来一局
  const playAgain = () => {
    setMatch(null);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setOpponentAnswered(false);
    startMatchmaking();
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  // 匹配中状态
  if (matchStatus === 'waiting' && !match) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <PKIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            PK对战
          </Typography>
        </Box>

        <Card sx={{ p: 4, borderRadius: 3 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            正在寻找对手...
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            已等待 {waitingTime} 秒
          </Typography>
          <Button
            variant="outlined"
            onClick={cancelMatchmaking}
            sx={{ borderRadius: 2, px: 4 }}
          >
            取消匹配
          </Button>
        </Card>
      </Container>
    );
  }

  // 匹配成功，即将开始
  if (matchStatus === 'matched' && match) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          匹配成功!
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, my: 4 }}>
          <Box>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 1, mx: 'auto' }}>
              {match.player1.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {match.player1.username}
            </Typography>
            <Typography variant="caption">(你)</Typography>
          </Box>

          <Typography variant="h3" color="secondary.main">
            VS
          </Typography>

          <Box>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'secondary.main', mb: 1, mx: 'auto' }}>
              {match.player2?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {match.player2?.username}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" color="text.secondary">
          对战即将开始...
        </Typography>
      </Container>
    );
  }

  // 对战结束
  if (matchStatus === 'completed' && match) {
    const isWin = match.myScore > match.opponentScore;
    const isDraw = match.myScore === match.opponentScore;

    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <TrophyIcon
          sx={{
            fontSize: 80,
            color: isWin ? '#FFD700' : isDraw ? '#C0C0C0' : '#CD7F32',
            mb: 2,
          }}
        />

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isWin ? '恭喜你赢了!' : isDraw ? '平局!' : '很遗憾，下次加油!'}
        </Typography>

        <Card sx={{ p: 3, borderRadius: 3, my: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mb: 1, mx: 'auto' }}>
                {match.player1.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">
                {match.player1.username} (你)
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {match.myScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                正确 {match.myCorrect}/{match.totalRounds} 题
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.main', mb: 1, mx: 'auto' }}>
                {match.player2?.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">
                {match.player2?.username}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {match.opponentScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                正确 {match.opponentCorrect}/{match.totalRounds} 题
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {isWin && (
          <Chip
            label={`+50 积分`}
            color="success"
            sx={{ fontSize: '1rem', py: 2, px: 1, mb: 3 }}
          />
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={playAgain}
            sx={{ borderRadius: 2, px: 4 }}
          >
            再来一局
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/home')}
            sx={{ borderRadius: 2, px: 4 }}
          >
            返回首页
          </Button>
        </Box>
      </Container>
    );
  }

  // 对战进行中
  if (matchStatus === 'playing' && match && currentQuestion) {
    return (
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* 顶部信息 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton onClick={() => navigate('/home')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            PK对战 - 第 {match.currentRound}/{match.totalRounds} 题
          </Typography>
          <Box sx={{ width: 48 }} />
        </Box>

        {/* 对战双方信息 */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={5} sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', mb: 1, mx: 'auto' }}>
                  {match.player1.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {match.myScore}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  正确 {match.myCorrect} 题
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="secondary.main" fontWeight="bold">
                  VS
                </Typography>
              </Grid>
              <Grid item xs={5} sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main', mb: 1, mx: 'auto' }}>
                  {match.player2?.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {match.opponentScore}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  正确 {match.opponentCorrect} 题
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 倒计时 */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Chip
            icon={<TimerIcon />}
            label={`${timeLeft} 秒`}
            color={timeLeft <= 5 ? 'error' : 'primary'}
            sx={{ fontSize: '1.2rem', py: 2, px: 1 }}
          />
          {opponentAnswered && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              对手已答题
            </Typography>
          )}
        </Box>

        {/* 题目 */}
        <Card sx={{ p: 3, borderRadius: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" color="primary.main">
            {currentQuestion.expression}
          </Typography>
        </Card>

        {/* 答案选项 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 1.5,
          }}
        >
          {currentQuestion.options.map((option: number, index: number) => {
            const isSelected = selectedAnswer === option;
            const showResult = answerResult !== null;

            let bgColor = 'background.paper';
            let borderColor = 'primary.main';
            let textColor = 'text.primary';

            if (showResult) {
              if (option === currentQuestion.answer) {
                bgColor = '#E8F5E9';
                borderColor = '#4CAF50';
                textColor = '#4CAF50';
              } else if (isSelected && answerResult === 'wrong') {
                bgColor = '#FFEBEE';
                borderColor = '#F44336';
                textColor = '#F44336';
              }
            } else if (isSelected) {
              bgColor = 'primary.light';
              borderColor = 'primary.main';
            }

            return (
              <Button
                key={index}
                variant="outlined"
                disabled={selectedAnswer !== null}
                onClick={() => selectAnswer(option)}
                sx={{
                  py: 2,
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  bgcolor: bgColor,
                  borderColor,
                  color: textColor,
                  '&:hover': {
                    bgcolor: bgColor,
                    borderColor,
                  },
                  '&:disabled': {
                    bgcolor: bgColor,
                    borderColor,
                    color: textColor,
                  },
                }}
              >
                {option}
                {showResult && option === currentQuestion.answer && (
                  <CorrectIcon sx={{ ml: 0.5, fontSize: 20 }} />
                )}
                {showResult && isSelected && answerResult === 'wrong' && (
                  <WrongIcon sx={{ ml: 0.5, fontSize: 20 }} />
                )}
              </Button>
            );
          })}
        </Box>

        {/* 答题结果提示 */}
        {answerResult && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            {answerResult === 'correct' ? (
              <Typography variant="h5" color="success.main" fontWeight="bold">
                正确! +10分
              </Typography>
            ) : (
              <Typography variant="h5" color="error.main" fontWeight="bold">
                答错了，正确答案是 {currentQuestion.answer}
              </Typography>
            )}
          </Box>
        )}
      </Container>
    );
  }

  return null;
};

export default PKMatchPage;