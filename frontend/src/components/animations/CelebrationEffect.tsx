import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationEffectProps {
  trigger: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  trigger,
  intensity = 'medium'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (trigger) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const instance = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });

      const options = {
        particleCount: intensity === 'low' ? 30 : intensity === 'medium' ? 60 : 100,
        spread: intensity === 'low' ? 30 : intensity === 'medium' ? 60 : 100,
        startVelocity: intensity === 'low' ? 25 : intensity === 'medium' ? 35 : 45,
        scalar: 0.8,
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
        gravity: 0.8,
        drift: 0,
        ticks: 200
      };

      instance(options);

      // 清理 canvas
      return () => {
        canvas.innerHTML = '';
      };
    }
  }, [trigger, intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};
