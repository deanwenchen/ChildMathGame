import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface ComboCounterProps {
  combo: number;
  show: boolean;
}

export const ComboCounter: React.FC<ComboCounterProps> = ({ combo, show }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (show && combo > 1) {
      setAnimationKey(prev => prev + 1);
    }
  }, [combo, show]);

  if (!show || combo < 2) return null;

  // 根据连击数获取颜色和大小
  const getComboStyle = () => {
    if (combo >= 10) {
      return {
        color: '#FFD700', // 金色
        scale: 1.5,
        glow: '0 0 30px rgba(255, 215, 0, 0.8)',
        emoji: '🔥'
      };
    } else if (combo >= 5) {
      return {
        color: '#FF6B6B', // 红色
        scale: 1.3,
        glow: '0 0 20px rgba(255, 107, 107, 0.6)',
        emoji: '⚡'
      };
    } else {
      return {
        color: '#4ECDC4', // 青色
        scale: 1.1,
        glow: '0 0 15px rgba(78, 205, 196, 0.5)',
        emoji: '✨'
      };
    }
  };

  const style = getComboStyle();

  return (
    <Box
      key={animationKey}
      sx={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9998,
        animation: 'comboPop 0.5s ease-out',
        textAlign: 'center',
        pointerEvents: 'none'
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
          fontWeight: 'bold',
          color: style.color,
          textShadow: style.glow,
          fontFamily: 'monospace'
        }}
      >
        {style.emoji} COMBO x{combo}! {style.emoji}
      </Typography>
      <style>{`
        @keyframes comboPop {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(${style.scale});
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};
