import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface StarRatingProps {
  stars: number; // 0-3
  showAnimation?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * 星级评价组件
 *
 * 用于显示关卡通关后的星级评价
 * 带渐进式动画效果
 */
const StarRating: React.FC<StarRatingProps> = ({
  stars,
  showAnimation = true,
  size = 'large',
}) => {
  const [displayedStars, setDisplayedStars] = useState(0);

  const sizeMap = {
    small: { starSize: 32 },
    medium: { starSize: 48 },
    large: { starSize: 64 },
  };

  const { starSize } = sizeMap[size];

  useEffect(() => {
    if (showAnimation && stars > 0) {
      // 渐进式显示星星
      const timer = setTimeout(() => {
        setDisplayedStars(stars);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDisplayedStars(stars);
    }
  }, [stars, showAnimation]);

  const getStarColor = (index: number) => {
    if (index > displayedStars) return '#E0E0E0'; // 灰色（未获得）
    if (stars === 3) return '#FFD700'; // 金色（3 星）
    if (stars === 2) return '#FFC107'; // 琥珀色（2 星）
    return '#FF9800'; // 橙色（1 星）
  };

  const getStarAnimation = (index: number) => {
    if (index > displayedStars) return {};

    return {
      animation: `starPop 0.5s ease ${index * 0.2}s backwards`,
      '@keyframes starPop': {
        '0%': { transform: 'scale(0)', opacity: 0 },
        '50%': { transform: 'scale(1.2)' },
        '100%': { transform: 'scale(1)', opacity: 1 },
      },
    };
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
        py: 2,
      }}
    >
      {[1, 2, 3].map((starIndex) => (
        <Box
          key={starIndex}
          sx={{
            width: starSize,
            height: starSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...getStarAnimation(starIndex),
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={getStarColor(starIndex)}
            style={{
              width: '100%',
              height: '100%',
              filter:
                starIndex <= displayedStars
                  ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  : 'none',
            }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </Box>
      ))}
    </Box>
  );
};

export default StarRating;
