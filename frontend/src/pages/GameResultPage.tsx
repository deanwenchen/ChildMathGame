import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import { useGame } from '../contexts/GameContext';
import { CelebrationEffect } from '../components/animations/CelebrationEffect';
import useSound from '../hooks/useSound';

const GameResultPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser, submitScore, soundEnabled } = useGame();
  const sound = useSound();

  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [showMedalAnimation, setShowMedalAnimation] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const savedResult = sessionStorage.getItem('gameResult');
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      navigate('/practice');
    }
  }, []);

  // 分数累加动画
  useEffect(() => {
    if (result && result.score !== undefined) {
      const targetScore = result.score;
      const duration = 1500; // 1.5 秒动画
      const startTime = Date.now();
      const startScore = 0;

      const animateScore = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用 ease-out 缓动函数
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        const currentScore = Math.floor(startScore + (targetScore - startScore) * easedProgress);

        if (progress < 1) {
          setDisplayScore(currentScore);
          requestAnimationFrame(animateScore);
        } else {
          setDisplayScore(targetScore);
          // 动画完成后显示庆祝效果（如果分数 >= 60）
          if (targetScore >= 60) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2000);
            // 播放庆祝音效
            if (soundEnabled) {
              sound.playCelebrate();
            }
          }
        }
      };

      requestAnimationFrame(animateScore);
    }
  }, [result]);

  // 勋章动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMedalAnimation(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 获取颜色根据分数
  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.primary.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // 获取勋章
  const getMedalIcon = (score: number) => {
    if (score >= 90) return '🥇';
    if (score >= 80) return '🥈';
    if (score >= 70) return '🥉';
    return '⭐';
  };

  // 保存成绩
  const handleSaveScore = async () => {
    if (!currentUser || !result) return;

    setIsSubmitting(true);
    try {
      await submitScore({
        user_id: currentUser.id,
        difficulty: result.difficulty,
        operation_type: result.operation,
        total_questions: result.totalQuestions,
        correct_count: result.correctCount,
        score: result.score,
        time_spent: result.timeSpent
      });

      navigate('/scores');
    } catch (error) {
      console.error('保存成绩失败:', error);
      alert('保存成绩失败，请重试');
      setIsSubmitting(false);
    }
  };

  // 不保存直接返回
  const handleSkipSave = () => {
    navigate('/');
  };

  if (!result) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card
        sx={{
          p: 4,
          bgcolor: getScoreColor(result.score),
          color: 'white',
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* 庆祝动画 */}
        {showCelebration && <CelebrationEffect intensity="high" />}

        {/* 标题 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              mx: 'auto',
              mb: 2,
              fontSize: '4rem',
              animation: showMedalAnimation ? 'medalPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none',
              '@keyframes medalPop': {
                '0%': {
                  transform: 'scale(0) rotate(-180deg)',
                  opacity: 0
                },
                '100%': {
                  transform: 'scale(1) rotate(0deg)',
                  opacity: 1
                }
              }
            }}
          >
            {getMedalIcon(result.score)}
          </Avatar>
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{
              animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.2s both' : 'none',
              '@keyframes slideUp': {
                '0%': {
                  transform: 'translateY(20px)',
                  opacity: 0
                },
                '100%': {
                  transform: 'translateY(0)',
                  opacity: 1
                }
              }
            }}
          >
            游戏结束！
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            {result.achievement}
          </Typography>
        </Box>

        {/* 成绩卡片 */}
        <Card
          elevation={3}
          sx={{
            mb: 4,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardContent>
            <Grid container spacing={3}>
              {/* 总分 */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    你的得分
                  </Typography>
                  <Typography
                    variant="h1"
                    fontWeight="bold"
                    sx={{
                      fontSize: '4rem',
                      mt: 1,
                      fontVariantNumeric: 'tabular-nums',
                      animation: showMedalAnimation ? 'scoreGlow 0.8s ease-out 0.5s both' : 'none',
                      '@keyframes scoreGlow': {
                        '0%': {
                          textShadow: '0 0 0 rgba(255,255,255,0)'
                        },
                        '100%': {
                          textShadow: '0 0 20px rgba(255,255,255,0.5)'
                        }
                      }
                    }}
                  >
                    {displayScore}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                    满分 100 分
                  </Typography>
                </Box>
              </Grid>

              {/* 详细统计 */}
              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <CheckCircleIcon
                  sx={{
                    fontSize: 40,
                    mb: 1,
                    animation: showMedalAnimation ? 'iconPop 0.5s ease-out 0.6s both' : 'none',
                    '@keyframes iconPop': {
                      '0%': { transform: 'scale(0)', opacity: 0 },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)', opacity: 1 }
                    }
                  }}
                />
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.7s both' : 'none'
                  }}
                >
                  {result.correctCount}/{result.totalQuestions}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.75s both' : 'none'
                  }}
                >
                  答对题目
                </Typography>
              </Grid>

              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <TimerIcon
                  sx={{
                    fontSize: 40,
                    mb: 1,
                    animation: showMedalAnimation ? 'iconPop 0.5s ease-out 0.6s both' : 'none'
                  }}
                />
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.7s both' : 'none'
                  }}
                >
                  {result.timeSpent}秒
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.75s both' : 'none'
                  }}
                >
                  总用时
                </Typography>
              </Grid>

              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <SchoolIcon
                  sx={{
                    fontSize: 40,
                    mb: 1,
                    animation: showMedalAnimation ? 'iconPop 0.5s ease-out 0.6s both' : 'none'
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.7s both' : 'none'
                  }}
                >
                  {result.difficulty === 'easy' ? '简单' : result.difficulty === 'medium' ? '中等' : '困难'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.75s both' : 'none'
                  }}
                >
                  难度级别
                </Typography>
              </Grid>

              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <StarIcon
                  sx={{
                    fontSize: 40,
                    mb: 1,
                    animation: showMedalAnimation ? 'iconPop 0.5s ease-out 0.6s both' : 'none'
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.7s both' : 'none'
                  }}
                >
                  {Math.round((result.correctCount / result.totalQuestions) * 100)}%
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.75s both' : 'none'
                  }}
                >
                  正确率
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSaveScore}
            disabled={isSubmitting}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: 'white',
              color: getScoreColor(result.score),
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.8s both' : 'none'
            }}
          >
            {isSubmitting ? '保存中...' : '💾 保存成绩'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleSkipSave}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: 'white',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              animation: showMedalAnimation ? 'slideUp 0.5s ease-out 0.9s both' : 'none'
            }}
          >
            🏠 返回首页
          </Button>
        </Box>

        {/* 小提示 */}
        <Box
          sx={{
            mt: 4,
            textAlign: 'center',
            animation: showMedalAnimation ? 'fadeIn 0.5s ease-out 1s both' : 'none',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 }
            }
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            保存成绩后可以在"我的成绩"页面查看历史记录和进步轨迹哦！
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default GameResultPage;
