/**
 * 错题本状态管理 Hook
 *
 * 功能：
 * 1. 管理错题本的加载和保存
 * 2. 捕获错题
 * 3. 记录复习结果
 * 4. 获取待复习队列
 * 5. 生成统计信息
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MistakeRecord,
  MistakeBookStats,
  ErrorType
} from '../types';
import {
  captureMistake as captureMistakeUtil,
  recordReview as recordReviewUtil,
  getReviewQueue as getReviewQueueUtil,
  getMistakeBookStats as getStatsUtil,
  loadMistakeBook as loadUtil,
  saveMistakeBook as saveUtil,
  clearMasteredMistakes,
  REVIEW_INTERVALS
} from '../utils/mistakeAnalyzer';

export interface UseMistakeBookReturn {
  // 状态
  mistakes: MistakeRecord[];
  isLoading: boolean;
  hasLoaded: boolean;

  // 统计信息
  stats: MistakeBookStats;
  pendingReviewCount: number;

  // 核心操作
  captureMistake: (
    expression: string,
    userAnswer: number,
    correctAnswer: number,
    errorType?: ErrorType
  ) => void;

  recordReview: (
    mistakeId: string,
    isCorrect: boolean
  ) => void;

  // 查询操作
  getReviewQueue: () => MistakeRecord[];
  getMistakeByExpression: (expression: string) => MistakeRecord | undefined;
  getUnreviewedMistakes: () => MistakeRecord[];

  // 管理操作
  refresh: () => void;
  clearMastered: () => void;
  resetAll: () => void;
}

/**
 * 错题本 Hook
 */
export const useMistakeBook = (): UseMistakeBookReturn => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 初始化加载错题本
  useEffect(() => {
    const loadMistakes = () => {
      try {
        const stored = loadUtil();
        setMistakes(stored);
        setHasLoaded(true);
      } catch (error) {
        console.error('加载错题本失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 延迟加载，避免阻塞初始渲染
    const timerId = setTimeout(loadMistakes, 100);
    return () => clearTimeout(timerId);
  }, []);

  // 计算统计信息
  const stats = useCallback((): MistakeBookStats => {
    return getStatsUtil(mistakes);
  }, [mistakes]);

  // 待复习题目数量
  const pendingReviewCount = useCallback(() => {
    return getReviewQueueUtil(mistakes).length;
  }, [mistakes]);

  // 捕获错题
  const captureMistake = useCallback((
    expression: string,
    userAnswer: number,
    correctAnswer: number,
    errorType?: ErrorType
  ) => {
    const updated = captureMistakeUtil(expression, userAnswer, correctAnswer, mistakes);
    setMistakes(updated);
  }, [mistakes]);

  // 记录复习结果
  const recordReview = useCallback((
    mistakeId: string,
    isCorrect: boolean
  ) => {
    const updated = recordReviewUtil(mistakeId, isCorrect, mistakes);
    setMistakes(updated);
  }, [mistakes]);

  // 获取待复习队列
  const getReviewQueue = useCallback((): MistakeRecord[] => {
    return getReviewQueueUtil(mistakes);
  }, [mistakes]);

  // 根据表达式查找错题
  const getMistakeByExpression = useCallback((
    expression: string
  ): MistakeRecord | undefined => {
    return mistakes.find(m => m.expression === expression && !m.mastered);
  }, [mistakes]);

  // 获取未复习的错题（从未复习过的）
  const getUnreviewedMistakes = useCallback((): MistakeRecord[] => {
    return mistakes.filter(m => m.reviewCount === 0 && !m.mastered);
  }, [mistakes]);

  // 刷新错题本
  const refresh = useCallback(() => {
    const stored = loadUtil();
    setMistakes(stored);
  }, []);

  // 清除已掌握的错题
  const clearMastered = useCallback(() => {
    const filtered = clearMasteredMistakes(mistakes);
    setMistakes(filtered);
  }, [mistakes]);

  // 重置所有错题（慎用）
  const resetAll = useCallback(() => {
    setMistakes([]);
    saveUtil([]);
  }, []);

  return {
    // 状态
    mistakes,
    isLoading,
    hasLoaded,

    // 统计信息
    stats: stats(),
    pendingReviewCount: pendingReviewCount(),

    // 核心操作
    captureMistake,
    recordReview,

    // 查询操作
    getReviewQueue,
    getMistakeByExpression,
    getUnreviewedMistakes,

    // 管理操作
    refresh,
    clearMastered,
    resetAll
  };
};

/**
 * 简化的错题捕获 Hook（仅用于捕获错题，不管理完整状态）
 *
 * 使用场景：在游戏页面中，只需要捕获错题，不需要完整管理
 */
export const useMistakeCapture = () => {
  // 捕获错题
  const captureMistake = useCallback((
    expression: string,
    userAnswer: number,
    correctAnswer: number,
    errorType?: ErrorType
  ) => {
    const current = loadUtil();
    const updated = captureMistakeUtil(expression, userAnswer, correctAnswer, current);
    // 触发存储事件，让其他组件知道数据已更新
    window.dispatchEvent(new Event('storage'));
    return updated;
  }, []);

  // 检查是否是错题（已存在于错题本中）
  const isMistake = useCallback((expression: string): boolean => {
    const current = loadUtil();
    return current.some(m => m.expression === expression && !m.mastered);
  }, []);

  // 获取错题统计
  const getStats = useCallback((): MistakeBookStats => {
    const current = loadUtil();
    return getStatsUtil(current);
  }, []);

  return {
    captureMistake,
    isMistake,
    getStats
  };
};

export default useMistakeBook;
