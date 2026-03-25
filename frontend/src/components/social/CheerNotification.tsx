import React from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Cheer, CheerType } from '../../types/social';

interface CheerNotificationProps {
  cheer: Cheer | null;
  onClose: () => void;
}

/**
 * 根据加油类型获取颜色
 */
const getCheerColor = (type: CheerType): string => {
  const colors = {
    encourage: '#FF9800',
    celebrate: '#FFD700',
    good_luck: '#4CAF50',
  };
  return colors[type];
};

/**
 * 根据加油类型获取图标
 */
const getCheerEmoji = (type: CheerType): string => {
  const emojis = {
    encourage: '💪',
    celebrate: '🎉',
    good_luck: '🍀',
  };
  return emojis[type];
};

/**
 * 加油通知组件
 * 在屏幕顶部显示收到的加油消息
 */
const CheerNotification: React.FC<CheerNotificationProps> = ({
  cheer,
  onClose,
}) => {
  if (!cheer) return null;

  return (
    <Snackbar
      open={!!cheer}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 2 }}
    >
      <Alert
        severity="success"
        icon={false}
        sx={{
          width: '100%',
          bgcolor: getCheerColor(cheer.type),
          color: 'white',
          borderRadius: 3,
          boxShadow: 4,
          py: 1.5,
          px: 2,
        }}
        action={
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* 发送者头像 */}
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'rgba(255,255,255,0.3)',
              border: '2px solid white',
            }}
          >
            {cheer.sender.username.charAt(0).toUpperCase()}
          </Avatar>

          {/* 消息内容 */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {cheer.sender.username} 给你加油啦!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="h5">{getCheerEmoji(cheer.type)}</Typography>
              <Typography variant="body1" fontWeight="bold">
                {cheer.message}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default CheerNotification;