import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Badge,
} from '@mui/material';

interface SocialCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string | number;
  color?: 'primary' | 'secondary' | 'warning' | 'info';
  onClick: () => void;
}

/**
 * 社交功能入口卡片组件
 * 用于首页展示好友、排行榜、PK对战、学习小组等入口
 */
const SocialCard: React.FC<SocialCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  color = 'primary',
  onClick,
}) => {
  const colorMap = {
    primary: {
      bg: '#E8F5E9',
      border: '#4CAF50',
    },
    secondary: {
      bg: '#FFF3E0',
      border: '#FF9800',
    },
    warning: {
      bg: '#FFEBEE',
      border: '#F44336',
    },
    info: {
      bg: '#E3F2FD',
      border: '#2196F3',
    },
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.3s, box-shadow 0.3s',
        bgcolor: colorMap[color].bg,
        border: '2px solid',
        borderColor: colorMap[color].border,
        borderRadius: 3,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        '&:active': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ mb: 1 }}>
          {badge !== undefined ? (
            <Badge
              badgeContent={badge}
              color="error"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: 20,
                  minWidth: 20,
                },
              }}
            >
              <Box sx={{ fontSize: 40 }}>{icon}</Box>
            </Badge>
          ) : (
            <Box sx={{ fontSize: 40 }}>{icon}</Box>
          )}
        </Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SocialCard;