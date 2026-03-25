import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';

export interface ComboDisplayProps {
  combo: number;
  show: boolean;
  onAnimationComplete?: () => void;
}

/**
 * 连击显示组件 - Framer Motion 版本
 *
 * 替代原有的 ComboCounter，使用 Framer Motion 实现更流畅的动画效果
 * - 弹 spring 物理效果入场
 * - 连击数增长时数字滚动效果
 * - 根据连击数动态颜色/大小/特效
 * - 支持 AnimatePresence 退出动画
 * - 持续脉冲效果吸引注意
 */
export const ComboDisplay: React.FC<ComboDisplayProps> = ({
  combo,
  show,
  onAnimationComplete
}) => {
  const [prevCombo, setPrevCombo] = useState(combo);
  const [isIncreasing, setIsIncreasing] = useState(false);

  useEffect(() => {
    if (combo > prevCombo) {
      setIsIncreasing(true);
      const timer = setTimeout(() => setIsIncreasing(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCombo(combo);
  }, [combo, prevCombo]);

  // 根据连击数获取样式
  const getComboStyle = () => {
    if (combo >= 10) {
      return {
        color: '#FFD700', // 金色
        scale: 1.5,
        glow: '0 0 30px rgba(255, 215, 0, 0.8)',
        emoji: '🔥',
        level: 'legendary'
      };
    } else if (combo >= 5) {
      return {
        color: '#FF6B6B', // 红色
        scale: 1.3,
        glow: '0 0 20px rgba(255, 107, 107, 0.6)',
        emoji: '⚡',
        level: 'epic'
      };
    } else {
      return {
        color: '#4ECDC4', // 青色
        scale: 1.1,
        glow: '0 0 15px rgba(78, 205, 196, 0.5)',
        emoji: '✨',
        level: 'common'
      };
    }
  };

  const style = getComboStyle();

  // 入场动画 variants
  const containerVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      rotate: -180
    },
    animate: {
      scale: style.scale,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.1
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // 持续脉冲 variants
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: [
        style.glow,
        `0 0 ${parseInt(style.glow.split(' ')[2]) * 1.5}px ${style.color}`,
        style.glow
      ],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut'
      }
    }
  };

  // 数字增加动画
  const numberVariants = {
    idle: { y: 0, opacity: 1 },
    increase: {
      y: [-20, 0],
      opacity: [0, 1],
      scale: [1.5, 1],
      transition: { duration: 0.3 }
    }
  };

  if (!show || combo < 2) return null;

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {show && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9998,
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              borderRadius: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'center'
              }}
            >
              {/* 连击 Emoji - 带增加动画 */}
              <motion.span
                variants={numberVariants}
                animate={isIncreasing ? 'increase' : 'idle'}
                sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
              >
                {style.emoji}
              </motion.span>

              {/* 连击文字 */}
              <Typography
                sx={{
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                  fontWeight: 'bold',
                  color: style.color,
                  textShadow: style.glow,
                  fontFamily: 'monospace',
                  lineHeight: 1
                }}
              >
                COMBO
              </Typography>

              {/* 连击数字 - 带滚动效果 */}
              <motion.div
                variants={numberVariants}
                animate={isIncreasing ? 'increase' : 'idle'}
                style={{
                  minWidth: '60px',
                  display: 'inline-block'
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textShadow: `0 0 20px ${style.color}`,
                    fontFamily: 'monospace',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1
                  }}
                >
                  x{combo}
                </Typography>
              </motion.div>

              {/* 连击 Emoji - 带增加动画 */}
              <motion.span
                variants={numberVariants}
                animate={isIncreasing ? 'increase' : 'idle'}
                sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
              >
                {style.emoji}
              </motion.span>
            </Box>

            {/* 连击等级标签 */}
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: style.color,
                textTransform: 'uppercase',
                letterSpacing: 2,
                mt: 1,
                textShadow: style.glow
              }}
            >
              {style.level === 'legendary' && '🏆 传奇连击！'}
              {style.level === 'epic' && '🌟 史诗连击！'}
              {style.level === 'common' && '继续加油！'}
            </Typography>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Combo Counter Hook - 管理连击状态
 *
 * 用法示例:
 * const { combo, increment, reset, comboDisplay } = useComboSystem();
 */
export const useComboCounter = () => {
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [streak, setStreak] = useState(0); // 连续答对次数

  // 答对时调用
  const increment = () => {
    setStreak((prev) => prev + 1);
    setCombo((prev) => prev + 1);
    setShowCombo(true);

    // 2 秒后隐藏
    setTimeout(() => {
      setShowCombo(false);
    }, 2000);
  };

  // 答错时调用 - 重置连击
  const reset = () => {
    setStreak(0);
    setCombo(0);
    setShowCombo(false);
  };

  // 跳过题目 - 不中断连击
  const skip = () => {
    // 跳过不重置连击，但也不增加
    setShowCombo(false);
  };

  return {
    combo,
    streak,
    showCombo,
    increment,
    reset,
    skip
  };
};

export default ComboDisplay;
