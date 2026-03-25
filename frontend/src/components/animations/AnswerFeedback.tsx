import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@mui/material';

export interface AnswerFeedbackProps {
  isCorrect: boolean | null; // null 表示未作答
  show: boolean;
  children?: React.ReactNode;
  onComplete?: () => void;
  duration?: number; // 动画持续时间（毫秒）
}

/**
 * 答题反馈容器组件
 *
 * 使用 Framer Motion 实现的答题视觉反馈容器
 * - 答对：脉冲放大 + 金色边框闪烁
 * - 答错：柔和摇晃 + 灰色滤镜
 * - 支持 AnimatePresence 退出动画
 * - 动画时长符合 pedagogy.md 标准（0.3-0.8 秒）
 */
export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  show,
  children,
  onComplete,
  duration = 800
}) => {
  // 答对动画 variants
  const correctVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0px rgba(76, 175, 80, 0)',
        '0 0 20px rgba(76, 175, 80, 0.6)',
        '0 0 0px rgba(76, 175, 80, 0)'
      ],
      transition: {
        duration: duration / 1000,
        times: [0, 0.5, 1]
      }
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // 答错动画 variants - 柔和摇晃
  const wrongVariants = {
    initial: { x: 0, opacity: 1, filter: 'grayscale(0)' },
    animate: {
      x: [-10, 10, -10, 10, 0],
      filter: ['grayscale(0)', 'grayscale(0.5)', 'grayscale(0)'],
      transition: {
        duration: 0.5,
        times: [0, 0.25, 0.5, 0.75, 1]
      }
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // 中性/默认状态 variants
  const neutralVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  // 根据作答状态选择 variants
  const getVariants = () => {
    if (isCorrect === true) return correctVariants;
    if (isCorrect === false) return wrongVariants;
    return neutralVariants;
  };

  // 获取边框颜色
  const getBorderColor = () => {
    if (isCorrect === true) return '#4CAF50'; // 绿色
    if (isCorrect === false) return '#F44336'; // 红色
    return 'transparent';
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          variants={getVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 3,
              borderWidth: 3,
              borderStyle: 'solid',
              borderColor: getBorderColor(),
              overflow: 'hidden'
            }}
          >
            {children}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 答题反馈 Hook - 简化使用
 *
 * 用法示例:
 * const { variants, borderColor } = useAnswerFeedback(isCorrect);
 */
export const useAnswerFeedback = (isCorrect: boolean | null) => {
  const getVariants = () => {
    if (isCorrect === true) {
      return {
        initial: { scale: 1 },
        animate: {
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0px rgba(76, 175, 80, 0)',
            '0 0 20px rgba(76, 175, 80, 0.6)',
            '0 0 0px rgba(76, 175, 80, 0)'
          ],
          transition: { duration: 0.6 }
        }
      };
    }
    if (isCorrect === false) {
      return {
        initial: { x: 0 },
        animate: {
          x: [-10, 10, -10, 10, 0],
          transition: { duration: 0.5 }
        }
      };
    }
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.3 } }
    };
  };

  const getBorderColor = () => {
    if (isCorrect === true) return '#4CAF50';
    if (isCorrect === false) return '#F44336';
    return 'transparent';
  };

  return {
    variants: getVariants(),
    borderColor: getBorderColor()
  };
};

export default AnswerFeedback;
