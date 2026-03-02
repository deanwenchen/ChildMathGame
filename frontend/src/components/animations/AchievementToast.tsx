import React, { useEffect } from 'react';
import { Snackbar, Box, Typography, Paper } from '@mui/material';
import { Achievement } from '../../utils/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  open: boolean;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  open,
  onClose
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!achievement) return null;

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          bgcolor: 'transparent',
          boxShadow: 'none'
        }
      }}
    >
      <Paper
        elevation={8}
        sx={{
          bgcolor: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          p: 2,
          px: 4,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          animation: 'achievementSlide 0.5s ease-out, achievementPulse 1s ease-in-out infinite',
          '@keyframes achievementSlide': {
            '0%': {
              transform: 'translateY(-100px)',
              opacity: 0
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1
            }
          },
          '@keyframes achievementPulse': {
            '0%, 100%': {
              transform: 'scale(1)'
            },
            '50%': {
              transform: 'scale(1.05)'
            }
          }
        }}
      >
        <Typography sx={{ fontSize: '2.5rem' }}>{achievement.icon}</Typography>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              fontSize: '1.1rem'
            }}
          >
            成就解锁！
          </Typography>
          <Typography
            sx={{
              color: '#fff',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              fontSize: '0.9rem'
            }}
          >
            {achievement.name} - {achievement.description}
          </Typography>
        </Box>
      </Paper>
    </Snackbar>
  );
};
