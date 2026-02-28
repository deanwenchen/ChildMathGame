import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useGame } from '../contexts/GameContext';
import { Score, ScoreSummary } from '../types';

const ScorePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, getScores } = useGame();

  const [scores, setScores] = useState<Score[]>([]);
  const [summary, setSummary] = useState<ScoreSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    loadScores();
  }, [currentUser]);

  const loadScores = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const userScores = await getScores(currentUser.id);
      setScores(userScores);

      // 获取成绩摘要
      const response = await axios.get(`/scores/user/${currentUser.id}/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error('加载成绩失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  // 获取难度显示文本
  const getDifficultyText = (difficulty: string): string => {
    const map: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };
    return map[difficulty] || difficulty;
  };

  // 获取运算类型显示文本
  const getOperationText = (operation: string): string => {
    const map: Record<string, string> = {
      addition: '加法',
      subtraction: '减法',
      multiplication: '乘法',
      division: '除法'
    };
    return map[operation] || operation;
  };

  // 获取成绩颜色
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'success.main';
    if (score >= 70) return 'primary.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* 标题 */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <EmojiEventsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          我的成绩
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {currentUser.username} 的学习记录
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {!loading && summary && (
        <>
          {/* 成绩摘要 */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    总练习次数
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {summary.totalSessions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    平均得分
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {summary.averageScore}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    最高得分
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {summary.bestScore}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    总答题数
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.totalQuestions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    答对题目
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {summary.totalCorrect}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    正确率
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.accuracy}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 难度分布 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  难度分布
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`简单: ${summary.difficultyBreakdown.easy} 次`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`中等: ${summary.difficultyBreakdown.medium} 次`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`困难: ${summary.difficultyBreakdown.hard} 次`}
                  color="error"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* 历史成绩列表 */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUpIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              历史成绩
            </Typography>
          </Box>

          {scores.length === 0 ? (
            <Alert severity="info">还没有练习记录，快去开始练习吧！</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>日期</TableCell>
                    <TableCell>难度</TableCell>
                    <TableCell>运算</TableCell>
                    <TableCell>得分</TableCell>
                    <TableCell>正确率</TableCell>
                    <TableCell>用时</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scores.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell>
                        {new Date(score.created_at || '').toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getDifficultyText(score.difficulty)}
                          size="small"
                          color={score.difficulty === 'easy' ? 'success' : score.difficulty === 'medium' ? 'primary' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{getOperationText(score.operation_type)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={getScoreColor(score.score)}
                        >
                          {score.score} 分
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {Math.round((score.correct_count / score.total_questions) * 100)}%
                      </TableCell>
                      <TableCell>{formatTime(score.time_spent)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ScorePage;
