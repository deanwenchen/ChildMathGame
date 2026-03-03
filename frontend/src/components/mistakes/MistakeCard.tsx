import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Button,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  AutoFixHigh as AutoFixIcon,
  Calculate as CalculateIcon,
  Help as HelpIcon,
  HourglassEmpty as HourglassIcon,
} from '@mui/icons-material';
import { MistakeRecord, ErrorType } from '../../types';

interface MistakeCardProps {
  mistake: MistakeRecord;
  onReview?: (mistake: MistakeRecord) => void;
  showReviewButton?: boolean;
}

export const MistakeCard: React.FC<MistakeCardProps> = ({
  mistake,
  onReview,
  showReviewButton = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  // 获取错误类型显示文本
  const getErrorTypeText = (type: ErrorType): string => {
    const map: Record<ErrorType, string> = {
      decomposition_error: '分解错误',
      calculation_error: '计算错误',
      step_missing: '步骤遗漏',
      timeout: '超时',
      unknown: '未知错误',
    };
    return map[type];
  };

  // 获取错误类型图标
  const getErrorTypeIcon = (type: ErrorType): React.ReactNode => {
    const map: Record<ErrorType, React.ReactNode> = {
      decomposition_error: <AutoFixIcon fontSize="small" />,
      calculation_error: <CalculateIcon fontSize="small" />,
      step_missing: <HelpIcon fontSize="small" />,
      timeout: <HourglassIcon fontSize="small" />,
      unknown: <HelpIcon fontSize="small" />,
    };
    return map[type];
  };

  // 获取错误类型颜色
  const getErrorTypeColor = (type: ErrorType): 'error' | 'warning' | 'info' | 'default' => {
    const map: Record<ErrorType, 'error' | 'warning' | 'info' | 'default'> = {
      decomposition_error: 'warning',
      calculation_error: 'error',
      step_missing: 'info',
      timeout: 'default',
      unknown: 'default',
    };
    return map[type];
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 获取下次复习日期显示
  const getNextReviewText = (): string => {
    if (mistake.mastered) {
      return '已掌握';
    }
    const nextReview = new Date(mistake.nextReviewDate);
    const today = new Date();
    const diffTime = nextReview.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return '今天可以复习啦！';
    } else if (diffDays === 1) {
      return '明天复习';
    } else if (diffDays <= 7) {
      return `${diffDays}天后复习`;
    } else {
      return formatDate(mistake.nextReviewDate);
    }
  };

  // 生成解析提示
  const getExplanation = (): string => {
    const { expression, correctAnswer, errorType } = mistake;

    const errorAnalysis: Record<ErrorType, string> = {
      decomposition_error: '在分解小数时可能出错了。记住：要看大数需要几，把小数分成两部分。',
      calculation_error: '计算时可能粗心了。建议重新计算 10 加几的部分。',
      step_missing: '记住凑十法最后一步要加剩数哦！凑成十后，还要加上剩下的数。',
      timeout: '时间不够用了。多练习几次，你会越来越快的！',
      unknown: '重新做一遍这道题，巩固一下知识点吧。',
    };

    return `正确答案是 ${correctAnswer}。${errorAnalysis[errorType] || ''}`;
  };

  // 获取复习进度
  const getReviewProgress = (): number => {
    // 复习 5 次全对即为掌握
    return Math.min((mistake.reviewCount / 5) * 100, 100);
  };

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const handleReview = () => {
    if (onReview) {
      onReview(mistake);
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        },
        borderLeft: mistake.mastered ? '4px solid #4CAF50' : '4px solid #FF9800',
        position: 'relative',
      }}
    >
      {/* 掌握标记 */}
      {mistake.mastered && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'success.main',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          已掌握
        </Box>
      )}

      <CardContent>
        {/* 题目区域 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                fontFamily: 'monospace',
                fontSize: '2rem',
                color: 'primary.main',
              }}
            >
              {mistake.expression} = ?
            </Typography>
            {mistake.correctCount >= 3 && !mistake.mastered && (
              <Chip
                label="快掌握了！"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>

          {/* 答案对比 */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  你的答案
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="error.main"
                  sx={{ fontFamily: 'monospace' }}
                >
                  {mistake.userAnswer}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorIcon sx={{ color: 'text.disabled', fontSize: 32 }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  正确答案
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ fontFamily: 'monospace' }}
                >
                  {mistake.correctAnswer}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 标签区域 */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={getErrorTypeText(mistake.errorType)}
            size="small"
            color={getErrorTypeColor(mistake.errorType)}
            icon={getErrorTypeIcon(mistake.errorType)}
            variant="filled"
          />
          <Chip
            label={`错 ${mistake.mistakeCount} 次`}
            size="small"
            sx={{ bgcolor: 'grey.100' }}
          />
          <Chip
            label={`复习 ${mistake.reviewCount} 次`}
            size="small"
            sx={{ bgcolor: 'grey.100' }}
          />
          <Chip
            label={`连续正确 ${mistake.correctCount} 次`}
            size="small"
            color={mistake.correctCount >= 3 ? 'success' : 'default'}
            variant="outlined"
          />
          <Chip
            label={formatDate(mistake.createdAt)}
            size="small"
            sx={{ bgcolor: 'grey.100' }}
          />
        </Box>

        {/* 下次复习提醒 */}
        <Box
          sx={{
            mt: 1,
            px: 2,
            py: 1,
            bgcolor: mistake.nextReviewDate <= new Date().toISOString().split('T')[0]
              ? 'warning.lighter'
              : 'grey.50',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            下次复习
          </Typography>
          <Typography
            variant="caption"
            fontWeight="bold"
            color={mistake.mastered ? 'success.main' : 'warning.main'}
          >
            {getNextReviewText()}
          </Typography>
        </Box>

        {/* 展开/收起按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <IconButton
            onClick={handleExpand}
            size="small"
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandIcon />
          </IconButton>
        </Box>

        {/* 展开内容 */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />

          {/* 解析提示 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              💡 解析提示
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'info.lighter',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.light',
              }}
            >
              <Typography variant="body2">{getExplanation()}</Typography>
            </Box>
          </Box>

          {/* 复习进度 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              📊 掌握进度
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                <Box
                  sx={{
                    width: `${getReviewProgress()}%`,
                    height: '100%',
                    bgcolor: getReviewProgress() >= 100 ? 'success.main' : 'primary.main',
                    borderRadius: 1,
                    transition: 'width 0.5s',
                  }}
                />
              </Box>
              <Typography variant="caption" fontWeight="bold">
                {mistake.reviewCount}/5 次
              </Typography>
            </Box>
          </Box>

          {/* 重做按钮 */}
          {showReviewButton && onReview && (
            <Button
              variant="contained"
              fullWidth
              onClick={handleReview}
              startIcon={<RefreshIcon />}
              disabled={mistake.nextReviewDate > new Date().toISOString().split('T')[0] && !mistake.mastered}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                bgcolor: mistake.mastered
                  ? 'success.main'
                  : mistake.nextReviewDate <= new Date().toISOString().split('T')[0]
                  ? 'primary.main'
                  : 'grey.400',
                '&:hover': {
                  bgcolor: mistake.mastered
                    ? 'success.dark'
                    : mistake.nextReviewDate <= new Date().toISOString().split('T')[0]
                    ? 'primary.dark'
                    : 'grey.500',
                },
              }}
            >
              {mistake.mastered
                ? '已经掌握，可以再练习'
                : mistake.nextReviewDate <= new Date().toISOString().split('T')[0]
                ? '开始复习'
                : `等到 ${formatDate(mistake.nextReviewDate)} 再复习`}
            </Button>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};
