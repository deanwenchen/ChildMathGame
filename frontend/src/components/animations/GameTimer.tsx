import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';

interface GameTimerProps {
  totalTime?: number; // 总时间（秒），默认 30 秒
  onTimeout: () => void;
  disabled?: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  totalTime = 30,
  onTimeout,
  disabled = false
}) => {
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (disabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // 重置计时器
    setTimeLeft(totalTime);

    // 开始计时
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [totalTime, onTimeout, disabled]);

  // 计算进度百分比
  const progress = (timeLeft / totalTime) * 100;

  // 根据剩余时间获取颜色
  const getColor = () => {
    if (timeLeft <= 5) {
      return { circle: '#f44336', text: '#f44336' }; // 红色
    } else if (timeLeft <= 10) {
      return { circle: '#ff9800', text: '#ff9800' }; // 橙色
    } else {
      return { circle: '#4CAF50', text: '#4CAF50' }; // 绿色
    }
  };

  const colors = getColor();

  // 计算圆弧路径
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 50,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        style={{
          transform: 'rotate(-90deg)',
          width: 50,
          height: 50
        }}
      >
        {/* 背景圆环 */}
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="4"
        />
        {/* 进度圆环 */}
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke={colors.circle}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease'
          }}
        />
      </svg>
      {/* 时间数字 */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: colors.text,
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {timeLeft}
        </span>
      </Box>
    </Box>
  );
};
