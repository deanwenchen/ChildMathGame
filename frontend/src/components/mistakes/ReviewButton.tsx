import React from 'react';
import { Button, Box, Typography, Tooltip, Chip } from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { MistakeRecord } from '../../types';

interface ReviewButtonProps {
  /** 待复习题目数量 */
  pendingCount: number;

  /** 点击全部重做按钮的回调 */
  onReviewAll?: () => void;

  /** 是否有题目正在进行复习 */
  isLoading?: boolean;
}

export const ReviewButton: React.FC<ReviewButtonProps> = ({
  pendingCount,
  onReviewAll,
  isLoading = false,
}) => {
  const handleClick = () => {
    if (onReviewAll && pendingCount > 0) {
      onReviewAll();
    }
  };

  // 有待复习题目
  if (pendingCount > 0) {
    return (
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <Tooltip
          title={pendingCount <= 5 ? `有${pendingCount}道题待复习` : '有待复习的题目'}
          placement="left"
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleClick}
            disabled={isLoading}
            startIcon={<PlayIcon />}
            sx={{
              py: 1.5,
              px: 3,
              fontSize: '1.1rem',
              bgcolor: pendingCount > 0 ? 'secondary.main' : 'grey.400',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
              '&:hover': {
                bgcolor: 'secondary.dark',
                transform: 'scale(1.05)',
              },
              '&:disabled': {
                bgcolor: 'grey.400',
              },
              animation: pendingCount > 0 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': {
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                },
                '50%': {
                  boxShadow: '0 4px 20px rgba(255, 152, 0, 0.7)',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RefreshIcon />
              <Typography variant="button" fontWeight="bold">
                开始复习
              </Typography>
              <Chip
                label={pendingCount}
                size="small"
                sx={{
                  bgcolor: 'white',
                  color: 'secondary.main',
                  fontWeight: 'bold',
                  minWidth: 24,
                }}
              />
            </Box>
          </Button>
        </Tooltip>
      </Box>
    );
  }

  // 没有待复习题目
  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <Tooltip title="太棒了！没有待复习的题目" placement="left">
        <Button
          variant="contained"
          size="large"
          disabled
          startIcon={<CheckIcon />}
          sx={{
            py: 1.5,
            px: 3,
            fontSize: '1.1rem',
            bgcolor: 'success.main',
            opacity: 0.8,
          }}
        >
          <Typography variant="button" fontWeight="bold">
            已全部掌握
          </Typography>
        </Button>
      </Tooltip>
    </Box>
  );
};

/**
 * 单题重做按钮（用于 MistakeCard 中）
 */
export const SingleReviewButton: React.FC<{
  mistake: MistakeRecord;
  onReview?: (mistake: MistakeRecord) => void;
  disabled?: boolean;
}> = ({ mistake, onReview, disabled }) => {
  const isDue = !mistake.mastered && mistake.nextReviewDate <= new Date().toISOString().split('T')[0];
  const isMastered = mistake.mastered;

  if (isMastered) {
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => onReview?.(mistake)}
        startIcon={<RefreshIcon />}
        sx={{
          color: 'success.main',
          borderColor: 'success.main',
          '&:hover': {
            borderColor: 'success.dark',
            bgcolor: 'success.lighter',
          },
        }}
      >
        再练习
      </Button>
    );
  }

  if (isDue) {
    return (
      <Button
        variant="contained"
        size="small"
        onClick={() => onReview?.(mistake)}
        startIcon={<PlayIcon />}
        sx={{
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        开始复习
      </Button>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      disabled={disabled}
      startIcon={<RefreshIcon />}
      sx={{
        color: 'grey.400',
        borderColor: 'grey.300',
      }}
    >
      {new Date(mistake.nextReviewDate).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      })}
    </Button>
  );
};
