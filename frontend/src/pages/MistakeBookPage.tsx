import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  AutoFixHigh as AutoFixIcon,
  Calculate as CalculateIcon,
  Help as HelpIcon,
  HourglassEmpty as HourglassIcon,
  PlayArrow as PlayIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { MistakeRecord, MistakeFiltersState, OperationType, Difficulty, ErrorType } from '../../types';
import { MistakeCard } from '../../components/mistakes/MistakeCard';
import { MistakeFilters } from '../../components/mistakes/MistakeFilters';
import { ReviewButton } from '../../components/mistakes/ReviewButton';
import { useGame } from '../../contexts/GameContext';

// 模拟错题数据（后续会连接 API）
const generateMockMistakes = (): MistakeRecord[] => {
  const expressions = [
    { expr: '9+5', answer: 14 },
    { expr: '8+7', answer: 15 },
    { expr: '7+6', answer: 13 },
    { expr: '9+8', answer: 17 },
    { expr: '6+9', answer: 15 },
    { expr: '8+4', answer: 12 },
    { expr: '7+8', answer: 15 },
    { expr: '9+3', answer: 12 },
    { expr: '6+7', answer: 13 },
    { expr: '8+5', answer: 13 },
  ];

  const errorTypes: ErrorType[] = [
    'decomposition_error',
    'calculation_error',
    'step_missing',
    'timeout',
  ];

  const now = new Date();

  return expressions.map((item, index) => {
    const reviewCount = Math.floor(Math.random() * 5);
    const correctCount = Math.floor(Math.random() * (reviewCount + 1));
    const daysUntilNextReview = Math.floor(Math.random() * 7) - 2; // -2 to 5
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + daysUntilNextReview);

    return {
      id: `mistake-${index + 1}`,
      expression: item.expr,
      userAnswer: item.answer + Math.floor(Math.random() * 5) - 2,
      correctAnswer: item.answer,
      errorType: errorTypes[Math.floor(Math.random() * errorTypes.length)],
      mistakeCount: Math.floor(Math.random() * 5) + 1,
      reviewCount,
      correctCount,
      lastReviewDate: reviewCount > 0 ? new Date(now).toISOString() : null,
      nextReviewDate: nextReviewDate.toISOString(),
      createdAt: new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      mastered: reviewCount >= 5 && correctCount >= 5,
    };
  });
};

const MistakeBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useGame();

  // 状态
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MistakeFiltersState>({});
  const [selectedMistake, setSelectedMistake] = useState<MistakeRecord | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // 加载错题数据
  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    setLoading(true);
    try {
      // TODO: 从 API 加载错题数据
      // 暂时使用模拟数据
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockData = generateMockMistakes();
      setMistakes(mockData);
    } catch (error) {
      console.error('加载错题失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const stats = useMemo(() => {
    const total = mistakes.length;
    const mastered = mistakes.filter((m) => m.mastered).length;
    const pending = mistakes.filter((m) => !m.mastered && m.nextReviewDate <= new Date().toISOString().split('T')[0]).length;

    const byErrorType: Record<ErrorType, number> = {
      decomposition_error: 0,
      calculation_error: 0,
      step_missing: 0,
      timeout: 0,
      unknown: 0,
    };

    mistakes.forEach((m) => {
      byErrorType[m.errorType]++;
    });

    return {
      total,
      mastered,
      pending,
      byErrorType,
    };
  }, [mistakes]);

  // 筛选后的错题
  const filteredMistakes = useMemo(() => {
    return mistakes.filter((mistake) => {
      if (filters.reviewed !== undefined && mistake.mastered !== filters.reviewed) {
        return false;
      }
      // 可以添加更多筛选逻辑
      return true;
    });
  }, [mistakes, filters]);

  // 处理筛选
  const handleFilterChange = (newFilters: MistakeFiltersState) => {
    setFilters(newFilters);
  };

  // 处理复习单题
  const handleReviewSingle = (mistake: MistakeRecord) => {
    setSelectedMistake(mistake);
    setShowReviewDialog(true);
  };

  // 处理开始复习
  const handleStartReview = () => {
    // TODO: 跳转到复习页面或开始复习会话
    console.log('开始复习', selectedMistake);
    setShowReviewDialog(false);
  };

  // 处理全部重做
  const handleReviewAll = () => {
    // TODO: 开始批量复习
    const pendingMistakes = mistakes.filter(
      (m) => !m.mastered && m.nextReviewDate <= new Date().toISOString().split('T')[0]
    );
    console.log('批量复习', pendingMistakes);
  };

  // 获取错误类型图标
  const getErrorTypeIcon = (type: ErrorType) => {
    const icons: Record<ErrorType, React.ReactNode> = {
      decomposition_error: <AutoFixIcon />,
      calculation_error: <CalculateIcon />,
      step_missing: <HelpIcon />,
      timeout: <HourglassIcon />,
      unknown: <HelpIcon />,
    };
    return icons[type];
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, mb: 10 }}>
      {/* 返回按钮 */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/home')}
        sx={{ mb: 2 }}
      >
        返回首页
      </Button>

      {/* 页面标题 */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'secondary.main',
            mx: 'auto',
            mb: 2,
          }}
        >
          <StarIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          错题本
        </Typography>
        <Typography variant="body1" color="text.secondary">
          温故而知新，定期复习进步更快！
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                总错题
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                待复习
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                已掌握
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {stats.mastered}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 掌握进度 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="subtitle1" fontWeight="bold">
              总体掌握进度
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0}
              sx={{ flex: 1, height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 错误类型分布 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            错误类型分布
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {Object.entries(stats.byErrorType).map(([type, count]) =>
              count > 0 ? (
                <Chip
                  key={type}
                  icon={getErrorTypeIcon(type as ErrorType)}
                  label={`${
                    {
                      decomposition_error: '分解错误',
                      calculation_error: '计算错误',
                      step_missing: '步骤遗漏',
                      timeout: '超时',
                      unknown: '未知',
                    }[type]
                  } (${count})`}
                  color={
                    type === 'calculation_error'
                      ? 'error'
                      : type === 'decomposition_error'
                      ? 'warning'
                      : 'default'
                  }
                  variant="outlined"
                />
              ) : null
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 筛选器 */}
      <MistakeFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        mistakeSummary={{
          byOperationType: { addition: 0, subtraction: 0, multiplication: 0, division: 0 },
          byDifficulty: { easy: 0, medium: 0, hard: 0 },
          byErrorType: stats.byErrorType,
        }}
      />

      {/* 错题列表 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <LinearProgress sx={{ width: '100%', maxWidth: 300 }} />
        </Box>
      ) : filteredMistakes.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" gutterBottom>
            {Object.keys(filters).length > 0
              ? '没有符合条件的错题'
              : '错题本是空的，快去练习吧！'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/practice')}
            sx={{ mt: 2 }}
          >
            开始练习
          </Button>
        </Alert>
      ) : (
        <Box>
          {filteredMistakes.map((mistake) => (
            <MistakeCard
              key={mistake.id}
              mistake={mistake}
              onReview={handleReviewSingle}
            />
          ))}
        </Box>
      )}

      {/* 悬浮复习按钮 */}
      <ReviewButton
        pendingCount={stats.pending}
        onReviewAll={handleReviewAll}
      />

      {/* 复习对话框 */}
      <Dialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              开始复习
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMistake && (
            <Box>
              <Typography variant="body1" mb={2}>
                准备好复习这道题了吗？
              </Typography>
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'primary.lighter',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" fontWeight="bold" fontFamily="monospace">
                  {selectedMistake.expression} = ?
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                认真思考，相信你一定能做对！
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleStartReview}
            startIcon={<PlayIcon />}
          >
            开始
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MistakeBookPage;
