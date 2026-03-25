import React from 'react';
import { motion } from 'framer-motion';
import { Button, Typography, Box } from '@mui/material';

export interface AnswerButtonProps {
  value: number;
  isSelected: boolean;
  isCorrect: boolean | null; // null 表示未揭晓答案
  onClick: () => void;
  disabled: boolean;
  showResult?: boolean; // 是否显示结果状态
}

/**
 * 答题按钮组件
 *
 * 使用 Framer Motion 实现的交互式答案按钮
 * - whileTap: 按下时缩小效果
 * - whileHover: 悬停时放大效果
 * - 答对：绿色脉冲 + 对勾图标
 * - 答错：红色闪烁 + 叉号图标
 * - 支持 useReducedMotion
 */
export const AnswerButton: React.FC<AnswerButtonProps> = ({
  value,
  isSelected,
  isCorrect,
  onClick,
  disabled,
  showResult = false
}) => {
  // 按钮动画 variants
  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      transition: { duration: 0.15 }
    },
    tap: {
      scale: 0.95,
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      transition: { duration: 0.1 }
    },
    selected: {
      scale: 1.05,
      boxShadow: '0 0 0 3px rgba(78, 205, 196, 0.5)',
      borderColor: '#4ECDC4'
    },
    correct: {
      scale: [1, 1.05, 1],
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
      boxShadow: '0 0 20px rgba(76, 175, 80, 0.6)',
      transition: { duration: 0.4 }
    },
    wrong: {
      x: [-8, 8, -8, 8, 0],
      backgroundColor: '#F44336',
      borderColor: '#F44336',
      transition: { duration: 0.5 }
    }
  };

  // 根据状态获取背景颜色
  const getBackgroundColor = () => {
    if (showResult && isCorrect === true) return '#4CAF50';
    if (showResult && isCorrect === false) return '#F44336';
    if (isSelected) return '#4ECDC4';
    return '#ffffff';
  };

  // 根据状态获取文字颜色
  const getTextColor = () => {
    if (showResult) return '#ffffff';
    if (isSelected) return '#ffffff';
    return '#333333';
  };

  // 获取边框颜色
  const getBorderColor = () => {
    if (showResult && isCorrect === true) return '#4CAF50';
    if (showResult && isCorrect === false) return '#F44336';
    if (isSelected) return '#4ECDC4';
    return '#e0e0e0';
  };

  // 渲染结果图标
  const renderResultIcon = () => {
    if (!showResult || isCorrect === null) return null;

    return (
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          fontSize: '1.5rem'
        }}
      >
        {isCorrect ? '✓' : '✗'}
      </motion.span>
    );
  };

  return (
    <motion.div
      variants={buttonVariants}
      initial="rest"
      animate={
        showResult && isCorrect === true
          ? 'correct'
          : showResult && isCorrect === false
          ? 'wrong'
          : isSelected
          ? 'selected'
          : 'rest'
      }
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled ? 'tap' : undefined}
      style={{
        width: '100%'
      }}
    >
      <Button
        variant="outlined"
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: '100%',
          minHeight: '80px',
          fontSize: '2rem',
          fontWeight: 'bold',
          borderRadius: 3,
          borderWidth: 3,
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
          transition: 'all 0.2s ease',
          '&:hover': {
            borderWidth: 3,
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor()
          },
          '&:disabled': {
            borderWidth: 3,
            borderColor: getBorderColor(),
            backgroundColor: showResult ? getBackgroundColor() : '#f5f5f5',
            color: showResult ? '#ffffff' : '#999999'
          },
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography
            variant="h3"
            component="span"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              fontFamily: 'monospace',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            {value}
          </Typography>
        </Box>
        {renderResultIcon()}
      </Button>
    </motion.div>
  );
};

/**
 * 答案按钮组 - 用于显示多个选项
 */
export interface AnswerButtonGroupProps {
  options: number[];
  selectedValue: number | null;
  correctValue: number | null;
  onSelect: (value: number) => void;
  disabled: boolean;
  showResult: boolean;
  columns?: number; // 每行显示的按钮数量
}

export const AnswerButtonGroup: React.FC<AnswerButtonGroupProps> = ({
  options,
  selectedValue,
  correctValue,
  onSelect,
  disabled,
  showResult,
  columns = 2
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 2,
        width: '100%'
      }}
    >
      {options.map((option) => (
        <AnswerButton
          key={option}
          value={option}
          isSelected={selectedValue === option}
          isCorrect={showResult ? option === correctValue : null}
          onClick={() => onSelect(option)}
          disabled={disabled}
          showResult={showResult}
        />
      ))}
    </Box>
  );
};

export default AnswerButton;
