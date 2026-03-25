import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';

export interface ProgressIndicatorProps {
  current: number; // 当前题号 (从 1 开始)
  total: number; // 总题数
  showLabels?: boolean; // 是否显示文字标签
}

/**
 * 进度指示器组件
 *
 * 使用 Framer Motion layout animations 实现的进度可视化
 * - 进度点模式：每个题目一个圆点，答完填充
 * - 进度条模式：连续进度条
 * - 支持 AnimatePresence 进入/退出动画
 * - 符合儿童友好的视觉设计
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  showLabels = true
}) => {
  // 进度点动画 variants
  const dotVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    completed: {
      backgroundColor: '#4CAF50',
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    },
    current: {
      backgroundColor: '#FF9800',
      scale: 1.1,
      boxShadow: '0 0 12px rgba(255, 152, 0, 0.6)'
    },
    pending: {
      backgroundColor: '#e0e0e0',
      scale: 1
    }
  };

  // 生成进度点数组
  const dots = Array.from({ length: total }, (_, i) => ({
    index: i + 1,
    status:
      i + 1 < current
        ? 'completed'
        : i + 1 === current
        ? 'current'
        : 'pending'
  }));

  // 计算进度百分比
  const progress = ((current - 1) / total) * 100;

  return (
    <Box sx={{ width: '100%' }}>
      {showLabels && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            mb: 1,
            fontSize: '0.875rem'
          }}
        >
          第 {current} 题 / 共 {total} 题
        </Typography>
      )}

      {/* 进度点 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          py: 1
        }}
      >
        <AnimatePresence>
          {dots.map((dot) => (
            <motion.div
              key={dot.index}
              variants={dotVariants}
              initial="initial"
              animate={dot.status}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              style={{
                width: dot.status === 'current' ? 14 : 10,
                height: dot.status === 'current' ? 14 : 10,
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </AnimatePresence>
      </Box>

      {/* 进度条 */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 8,
          backgroundColor: '#e0e0e0',
          borderRadius: 4,
          overflow: 'hidden',
          mt: 1
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20
          }}
          style={{
            height: '100%',
            backgroundColor: progress >= 100 ? '#4CAF50' : '#FF9800',
            borderRadius: 4
          }}
        />
      </Box>
    </Box>
  );
};

/**
 * 关卡进度组件 - 用于显示多个关卡的完成情况
 */
export interface LevelProgressProps {
  levels: Array<{
    id: string;
    name: string;
    completed: boolean;
    stars?: number; // 0-3 星
    locked?: boolean;
  }>;
  onSelectLevel?: (levelId: string) => void;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  levels,
  onSelectLevel
}) => {
  const levelVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      cursor: onSelectLevel ? 'pointer' : 'default'
    },
    tap: {
      scale: 0.95
    }
  };

  const renderStars = (stars: number = 0) => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[1, 2, 3].map((star) => (
          <Typography
          key={star}
          sx={{
            fontSize: '0.875rem',
            color: star <= stars ? '#FFD700' : '#e0e0e0'
          }}
          >
            ★
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%'
      }}
    >
      {levels.map((level) => (
        <motion.div
          key={level.id}
          variants={levelVariants}
          initial="initial"
          animate="animate"
          whileHover={onSelectLevel && !level.locked ? 'hover' : undefined}
          whileTap={onSelectLevel && !level.locked ? 'tap' : undefined}
          onClick={() => !level.locked && onSelectLevel?.(level.id)}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: level.locked
              ? '#f5f5f5'
              : level.completed
              ? '#e8f5e9'
              : '#ffffff',
            border: `2px solid ${
              level.locked
                ? '#e0e0e0'
                : level.completed
                ? '#4CAF50'
                : '#FF9800'
            }`,
            opacity: level.locked ? 0.6 : 1,
            cursor: level.locked ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: level.locked
                  ? '#e0e0e0'
                  : level.completed
                  ? '#4CAF50'
                  : '#FF9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold'
              }}
            >
              {level.locked ? '🔒' : level.completed ? '✓' : '▶'}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: level.locked ? '#999' : '#333'
              }}
            >
              {level.name}
            </Typography>
          </Box>
          {!level.locked && level.completed && renderStars(level.stars)}
        </motion.div>
      ))}
    </Box>
  );
};

export default ProgressIndicator;
