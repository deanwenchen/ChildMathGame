/**
 * NumberDecompose.tsx
 * 数字分解动画组件 - 实现"分小数"步骤
 *
 * 功能：将小数（如 4）分解成两部分（1 和 3）
 * 动画：数字像积木一样"裂开"成两部分
 *
 * @param number - 要分解的数字（如 4）
 * @param part1 - 第一部分（如 1）- 用于凑十的部分，蓝色高亮
 * @param part2 - 第二部分（如 3）- 剩余部分，绿色
 * @param onAnimationComplete - 分解完成回调
 * @param isVisible - 是否显示分解动画
 */

import React, { useEffect, useState } from 'react';

interface NumberDecomposeProps {
  number: number;
  part1: number;
  part2: number;
  onAnimationComplete?: () => void;
  isVisible: boolean;
}

export const NumberDecompose: React.FC<NumberDecomposeProps> = ({
  number,
  part1,
  part2,
  onAnimationComplete,
  isVisible,
}) => {
  const [isSplitting, setIsSplitting] = useState(false);
  const [showParts, setShowParts] = useState(false);
  const [isPart1Moving, setIsPart1Moving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // 开始分裂动画
      setIsSplitting(true);

      // 分裂动画完成后显示两部分
      const splitTimer = setTimeout(() => {
        setIsSplitting(false);
        setShowParts(true);

        // Pedagogy 要求：借数动画停留 1.5 秒
        const pauseTimer = setTimeout(() => {
          setIsPart1Moving(true);

          // 移动动画完成后触发回调
          const moveTimer = setTimeout(() => {
            onAnimationComplete?.();
          }, 1000);

          return () => clearTimeout(moveTimer);
        }, 1500); // 1.5 秒停留 - 符合 Pedagogy 要求

        return () => clearTimeout(pauseTimer);
      }, 500);

      return () => clearTimeout(splitTimer);
    } else {
      // 重置状态
      setIsSplitting(false);
      setShowParts(false);
      setIsPart1Moving(false);
    }
  }, [isVisible, onAnimationComplete]);

  return (
    <div className="decomposition-section">
      {/* 原始数字块 - UI/UX: 使用#B2E2F2 蓝色标注 */}
      <div
        className={`number-block ${isSplitting ? 'splitting' : ''}`}
        style={{
          opacity: showParts ? 0 : 1,
          background: '#B2E2F2', // UI/UX: 明显标注蓝色
          color: '#333',
        }}
      >
        {number}
      </div>

      {/* 分解后的两部分 */}
      <div
        className="split-container"
        style={{
          opacity: showParts ? 1 : 0,
          transform: showParts ? 'translateY(0)' : 'translateY(-20px)',
        }}
      >
        {/* Part 1: 用于凑十的部分 - 蓝色高亮 */}
        <div
          className={`split-part part-1 ${isPart1Moving ? 'moving' : ''}`}
          style={{
            background: '#B2E2F2', // UI/UX: 蓝色明显标注
            color: '#333',
            boxShadow: isPart1Moving
              ? '0 6px 25px rgba(178, 226, 242, 0.8)'
              : '0 3px 10px rgba(178, 226, 242, 0.5)',
          }}
        >
          {part1}
        </div>

        {/* Part 2: 剩余部分 - 绿色 */}
        <div
          className="split-part part-3"
          style={{
            background: '#E8F5E9',
            color: '#2d5a2d',
          }}
        >
          {part2}
        </div>
      </div>

      <style>{`
        .decomposition-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
          min-height: 120px;
        }

        .number-block {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: bold;
          transition: all 0.5s ease;
        }

        .number-block.splitting {
          animation: split-shake 0.5s ease-in-out;
        }

        @keyframes split-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .split-container {
          display: flex;
          gap: 80px;
          transition: all 0.5s ease;
          position: absolute;
        }

        .split-part {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          transition: all 0.5s ease;
        }

        .split-part.part-1.moving {
          animation: fly-to-big 1s ease-in-out forwards;
        }

        @keyframes fly-to-big {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-60px, -30px) scale(1.2);
            box-shadow: 0 8px 30px rgba(178, 226, 242, 0.9);
          }
          100% {
            transform: translate(-120px, -60px) scale(0);
            opacity: 0;
          }
        }

        .split-part.part-1 {
          box-shadow: 0 3px 10px rgba(178, 226, 242, 0.5);
        }
      `}</style>
    </div>
  );
};

export default NumberDecompose;
