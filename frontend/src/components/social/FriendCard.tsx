import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Badge,
  Button,
  Chip,
} from '@mui/material';
import {
  Favorite as CheerIcon,
  SportsKabaddi as PKIcon,
} from '@mui/icons-material';
import { Friend, UserStatus } from '../../types/social';

interface FriendCardProps {
  friend: Friend;
  onSendCheer: (friendId: number) => void;
  onInvitePK: (friendId: number) => void;
}

/**
 * 获取状态显示配置
 */
const getStatusConfig = (status: UserStatus) => {
  const configs = {
    online: { color: '#4CAF50', text: '在线' },
    offline: { color: '#9E9E9E', text: '离线' },
    in_game: { color: '#FF9800', text: '游戏中' },
  };
  return configs[status];
};

/**
 * 格式化最后活跃时间
 */
const formatLastActive = (lastActiveAt?: string): string => {
  if (!lastActiveAt) return '';

  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  const diffMs = now.getTime() - lastActive.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚在线';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return lastActive.toLocaleDateString('zh-CN');
};

/**
 * 好友卡片组件
 * 显示好友信息、在线状态、操作按钮
 */
const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onSendCheer,
  onInvitePK,
}) => {
  const statusConfig = getStatusConfig(friend.status);
  const isOnline = friend.status === 'online';

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* 头像和在线状态 */}
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: statusConfig.color,
                  border: '2px solid white',
                }}
              />
            }
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
              }}
            >
              {friend.username.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>

          {/* 用户信息 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap fontWeight="bold">
              {friend.username}
            </Typography>

            {/* 状态标签 */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              {isOnline ? (
                <>
                  {friend.currentStreak > 0 && (
                    <Chip
                      label={`连续学习${friend.currentStreak}天`}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  )}
                  {friend.todayCorrect > 0 && (
                    <Chip
                      label={`今日答对${friend.todayCorrect}题`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  )}
                </>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {formatLastActive(friend.lastActiveAt)}
                </Typography>
              )}
            </Box>
          </Box>

          {/* 操作按钮 */}
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CheerIcon />}
              onClick={() => onSendCheer(friend.id)}
              sx={{
                borderRadius: 2,
                minWidth: 'auto',
                px: 2,
              }}
            >
              加油
            </Button>
            {isOnline && (
              <Button
                variant="contained"
                size="small"
                color="secondary"
                startIcon={<PKIcon />}
                onClick={() => onInvitePK(friend.id)}
                sx={{
                  borderRadius: 2,
                  minWidth: 'auto',
                  px: 2,
                }}
              >
                PK
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FriendCard;