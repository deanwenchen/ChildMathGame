import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import StarRating from './StarRating';

interface LevelCompleteDialogProps {
  open: boolean;
  level: string;
  stars: number;
  correctCount: number;
  totalCount: number;
  onNextLevel: () => void;
  onRetry: () => void;
  isLastLevel?: boolean;
}

/**
 * 关卡通关弹窗组件
 *
 * 显示：
 * - 关卡名称
 * - 星级评价
 * - 答对题数
 * - 下一关/重试按钮
 */
const LevelCompleteDialog: React.FC<LevelCompleteDialogProps> = ({
  open,
  level,
  stars,
  correctCount,
  totalCount,
  onNextLevel,
  onRetry,
  isLastLevel = false,
}) => {
  const getLevelName = (levelKey: string) => {
    const names: Record<string, string> = {
      '9': '9 加几',
      '8': '8 加几',
      '7': '7 加几',
      '6': '6 加几',
    };
    return names[levelKey] || levelKey;
  };

  const getMessage = (stars: number) => {
    const messages: Record<number, { text: string; emoji: string }> = {
      3: { text: '太棒了！完美！', emoji: '🏆' },
      2: { text: '很不错！继续加油！', emoji: '🌟' },
      1: { text: '不错哦！再接再厉！', emoji: '💪' },
      0: { text: '加油！你一定可以的！', emoji: '🔥' },
    };
    return messages[stars] || messages[0];
  };

  const message = getMessage(stars);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        {/* Emoji 图标 */}
        <Typography
          sx={{
            fontSize: '4rem',
            mb: 1,
            animation: 'bounce 1s infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            },
          }}
        >
          {message.emoji}
        </Typography>

        {/* 关卡名称 */}
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {getLevelName(level)} 完成！
        </Typography>

        {/* 鼓励文字 */}
        <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
          {message.text}
        </Typography>

        {/* 星级评价 */}
        <StarRating stars={stars} showAnimation={open} size="large" />

        {/* 答题统计 */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            mb: 3,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            答对题目
          </Typography>
          <Typography variant="h3" fontWeight="bold" color="primary.main">
            {correctCount} / {totalCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            正确率 {Math.round((correctCount / totalCount) * 100)}%
          </Typography>
        </Paper>

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLastLevel && stars >= 1 ? (
            // 最后一关且通关
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={onNextLevel}
              sx={{
                py: 2,
                fontSize: '1.2rem',
                bgcolor: 'success.main',
                '&:hover': { bgcolor: 'success.dark' },
              }}
            >
              🎉 恭喜通关！
            </Button>
          ) : stars >= 1 ? (
            // 普通关卡且通关
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={onNextLevel}
              sx={{
                py: 2,
                fontSize: '1.2rem',
              }}
            >
              下一关 →
            </Button>
          ) : null}

          {stars < 3 && (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={onRetry}
              sx={{ py: 2, fontSize: '1.2rem' }}
            >
              再试一次 🔄
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LevelCompleteDialog;
