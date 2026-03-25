import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { LeaderboardEntry } from '../../types/social';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

/**
 * 获取排名样式配置
 */
const getRankStyle = (rank: number) => {
  const styles: Record<number, { bg: string; color: string; medal: React.ReactNode }> = {
    1: {
      bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      color: '#FFFFFF',
      medal: <TrophyIcon sx={{ color: '#FFD700', fontSize: 32 }} />,
    },
    2: {
      bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
      color: '#FFFFFF',
      medal: <TrophyIcon sx={{ color: '#C0C0C0', fontSize: 32 }} />,
    },
    3: {
      bg: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
      color: '#FFFFFF',
      medal: <TrophyIcon sx={{ color: '#CD7F32', fontSize: 32 }} />,
    },
  };
  return styles[rank] || { bg: '#FFFFFF', color: 'inherit', medal: null };
};

/**
 * 排行榜项目组件
 */
const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  entry,
  isCurrentUser = false,
}) => {
  const rankStyle = getRankStyle(entry.rank);

  return (
    <ListItem
      sx={{
        mb: 1,
        borderRadius: 2,
        bgcolor: rankStyle.bg,
        border: isCurrentUser ? '3px solid #4CAF50' : '1px solid #E0E0E0',
        boxShadow: entry.rank <= 3 ? 2 : 0,
        py: 1.5,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 排名区域 */}
      <Box
        sx={{
          width: 50,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {rankStyle.medal ? (
          rankStyle.medal
        ) : (
          <Typography
            variant="h5"
            fontWeight="bold"
            color={isCurrentUser ? 'primary.main' : 'text.primary'}
          >
            {entry.rank}
          </Typography>
        )}
      </Box>

      {/* 当前用户标记 */}
      {isCurrentUser && (
        <StarIcon
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            color: '#4CAF50',
            fontSize: 20,
          }}
        />
      )}

      {/* 头像 */}
      <ListItemAvatar sx={{ mx: 1 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: isCurrentUser ? 'primary.main' : 'secondary.main',
            border: entry.rank <= 3 ? '2px solid white' : 'none',
          }}
        >
          {entry.user.username.charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>

      {/* 用户信息 */}
      <ListItemText
        primary={
          <Typography variant="subtitle1" fontWeight="bold" color={rankStyle.color}>
            {entry.user.username}
            {isCurrentUser && (
              <Typography
                component="span"
                variant="body2"
                sx={{ ml: 1, color: 'primary.main' }}
              >
                (你)
              </Typography>
            )}
          </Typography>
        }
        secondary={
          <Typography variant="body2" color={rankStyle.color} sx={{ opacity: 0.8 }}>
            正确 {entry.totalCorrect} 题
          </Typography>
        }
      />

      {/* 积分 */}
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          color={rankStyle.color}
        >
          {entry.totalPoints}
        </Typography>
        <Typography variant="caption" color={rankStyle.color} sx={{ opacity: 0.7 }}>
          积分
        </Typography>
      </Box>
    </ListItem>
  );
};

export default LeaderboardItem;