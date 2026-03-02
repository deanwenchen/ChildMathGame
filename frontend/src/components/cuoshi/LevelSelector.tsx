import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import { getAllLevels } from '../../utils/cuoshi';

interface Level {
  key: '9' | '8' | '7' | '6';
  label: string;
  color: string;
  bigNumber: number;
}

interface LevelSelectorProps {
  completedLevels: { '9': boolean; '8': boolean; '7': boolean; '6': boolean };
  levelStars: { '9': number; '8': number; '7': number; '6': number };
  onLevelSelect: (level: '9' | '8' | '7' | '6') => void;
}

/**
 * 关卡选择器组件
 *
 * 显示所有关卡，包括：
 * - 关卡名称和颜色
 * - 解锁状态
 * - 星级评价
 * - 完成状态
 */
const LevelSelector: React.FC<LevelSelectorProps> = ({
  completedLevels,
  levelStars,
  onLevelSelect,
}) => {
  const levels: Level[] = getAllLevels();

  const isLevelUnlocked = (level: '9' | '8' | '7' | '6'): boolean => {
    const levelOrder: ('9' | '8' | '7' | '6')[] = ['9', '8', '7', '6'];
    const currentIndex = levelOrder.indexOf(level);

    if (currentIndex === 0) return true; // 第一关总是解锁

    const prevLevel = levelOrder[currentIndex - 1];
    return completedLevels[prevLevel];
  };

  const renderStars = (stars: number) => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
        {[1, 2, 3].map((star) => (
          <Typography
            key={star}
            sx={{
              fontSize: '1.2rem',
              color: star <= stars ? '#FFD700' : '#E0E0E0',
            }}
          >
            ★
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {levels.map((level, index) => {
        const unlocked = isLevelUnlocked(level.key);
        const completed = completedLevels[level.key];
        const stars = levelStars[level.key];

        return (
          <Card
            key={level.key}
            onClick={() => unlocked && onLevelSelect(level.key)}
            sx={{
              position: 'relative',
              cursor: unlocked ? 'pointer' : 'not-allowed',
              opacity: unlocked ? 1 : 0.6,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: unlocked ? 'translateY(-4px)' : 'none',
                boxShadow: unlocked ? 6 : 1,
              },
              border: '2px solid',
              borderColor: level.color,
              overflow: 'visible',
            }}
          >
            {/* 关卡序号徽章 */}
            <Box
              sx={{
                position: 'absolute',
                top: -12,
                left: 16,
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: level.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: 2,
                zIndex: 1,
              }}
            >
              {index + 1}
            </Box>

            <CardContent sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* 关卡信息 */}
                <Box sx={{ flex: 1, ml: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {level.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {level.bigNumber} 加几的凑十法练习
                  </Typography>
                  {renderStars(stars)}
                </Box>

                {/* 完成状态 */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: completed ? 'success.main' : 'grey.200',
                    color: completed ? 'white' : 'grey.400',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  {completed ? '✓' : '→'}
                </Box>
              </Box>

              {/* 进度条（未完成时显示） */}
              {!completed && unlocked && (
                <LinearProgress
                  variant="buffer"
                  value={0}
                  sx={{
                    mt: 2,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: level.color,
                    },
                  }}
                />
              )}

              {/* 锁定提示 */}
              {!unlocked && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ color: 'white', fontSize: '2rem' }}>🔒</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default LevelSelector;
