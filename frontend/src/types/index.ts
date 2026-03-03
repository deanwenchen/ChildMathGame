// 用户类型
export interface User {
  id: number;
  username: string;
  age: number;
  grade: number;
  created_at?: string;
}

// 难度类型
export type Difficulty = 'easy' | 'medium' | 'hard';

// 运算类型
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

// 题目类型
export interface Question {
  id: string;
  expression: string;
  answer: number;
  difficulty: Difficulty;
  operationType: OperationType;
}

// 成绩类型
export interface Score {
  id?: number;
  user_id: number;
  difficulty: Difficulty;
  operation_type: OperationType;
  total_questions: number;
  correct_count: number;
  score: number;
  time_spent: number;
  created_at?: string;
}

// 成绩摘要
export interface ScoreSummary {
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: string;
  averageScore: number;
  bestScore: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// 反馈类型
export interface Feedback {
  message: string;
  type: 'success' | 'error';
}

// 游戏状态
export interface GameState {
  currentQuestion: Question | null;
  userAnswer: string;
  isAnswering: boolean;
  score: number;
  correctCount: number;
  questionCount: number;
  startTime: number;
  endTime: number;
}

// 错题记录
export interface Mistake {
  id: string;
  question_id: string;
  user_id: number;
  expression: string;
  userAnswer: number;
  correctAnswer: number;
  difficulty: Difficulty;
  operationType: OperationType;
  errorType: 'calculation' | 'concept' | 'careless' | 'timeout';
  createdAt: string;
  reviewed: boolean;
  reviewedAt?: string;
  reviewCount: number;
}

// 错误类型（用于错题本分析）
export type ErrorType =
  | 'decomposition_error'  // 分解错误（拆小数错误）
  | 'calculation_error'    // 计算错误（10 加几算错）
  | 'step_missing'         // 步骤遗漏（忘记加剩数）
  | 'timeout'              // 超时
  | 'unknown';             // 未知错误

// 错题记录（艾宾浩斯复习版）
export interface MistakeRecord {
  id: string;           // 唯一标识
  expression: string;   // 题目表达式（如 "9+5"）
  userAnswer: number;   // 用户答案
  correctAnswer: number; // 正确答案
  errorType: ErrorType; // 错误类型
  mistakeCount: number; // 错误次数
  reviewCount: number;  // 已复习次数
  correctCount: number; // 连续正确次数
  lastReviewDate: string | null; // 最后复习日期
  nextReviewDate: string; // 下次复习日期
  createdAt: string;    // 首次记录时间
  mastered: boolean;    // 是否已掌握（复习 5 次全对）
}

// 复习间隔（天）- 艾宾浩斯曲线
export type ReviewInterval = 1 | 2 | 4 | 7 | 15;

// 错题本统计
export interface MistakeBookStats {
  totalMistakes: number;      // 总错题数
  pendingReview: number;      // 待复习数
  masteredCount: number;      // 已掌握数
  errorTypeDistribution: {    // 错误类型分布
    decomposition_error: number;
    calculation_error: number;
    step_missing: number;
    timeout: number;
    unknown: number;
  };
  todayReviewCompleted: number; // 今日已完成复习数
}

// 错题筛选条件
export interface MistakeFilters {
  operationType?: OperationType;
  difficulty?: Difficulty;
  errorType?: Mistake['errorType'];
  dateRange?: {
    start: string;
    end: string;
  };
  reviewed?: boolean;
}

// 错题筛选器状态（用于 UI 组件）
export interface MistakeFiltersState {
  operationType?: OperationType;
  difficulty?: Difficulty;
  errorType?: ErrorType;
  reviewed?: boolean;
  mastered?: boolean;
}

// 错题统计
export interface MistakeSummary {
  totalMistakes: number;
  reviewedCount: number;
  unreviewedCount: number;
  byOperationType: Record<OperationType, number>;
  byDifficulty: Record<Difficulty, number>;
  byErrorType: Record<Mistake['errorType'], number>;
}

// ============================================================================
// 错题本系统增强类型（2026-03-03）
// 基于艾宾浩斯遗忘曲线的复习系统
// ============================================================================

/**
 * 复习记录接口
 * 记录每次复习的详细情况，用于追踪学习轨迹
 */
export interface ReviewRecord {
  /** 复习时间（ISO 8601） */
  reviewedAt: string;

  /** 复习是否正确 */
  isCorrect: boolean;

  /** 复习时的答案 */
  userAnswer: number;

  /** 复习用时（秒） */
  timeSpent: number;

  /** 复习后的复习次数 */
  reviewCount: number;

  /** 复习后的连续正确次数 */
  correctCount: number;
}

/**
 * 增强的错题记录接口
 * 在 MistakeRecord 基础上添加更多教学分析字段
 */
export interface EnhancedMistakeRecord extends MistakeRecord {
  /** 所属用户 ID */
  userId: number;

  /** 难度等级 */
  difficulty: Difficulty;

  /** 运算类型 */
  operationType: OperationType;

  /** 所属关卡（凑十法专用，例："9" 表示 9 加几） */
  level?: string;

  /** 错误分析说明（可选） */
  errorAnalysis?: string;

  /** 复习历史记录 */
  reviewHistory: ReviewRecord[];

  /** 掌握时间 */
  masteredAt?: string;
}

/**
 * 错题本统计信息（增强版）
 */
export interface EnhancedMistakeBookStats extends MistakeBookStats {
  /** 按复习阶段分类（艾宾浩斯 5 阶段） */
  byReviewStage: {
    stage0: number;  // 新错题，待首次复习
    stage1: number;  // 复习 1 次
    stage2: number;  // 复习 2 次
    stage3: number;  // 复习 3 次
    stage4: number;  // 复习 4 次，待最终确认
  };

  /** 最近 7 天复习趋势 */
  reviewTrend: {
    date: string;
    reviewed: number;
    mastered: number;
  }[];
}

/**
 * 复习会话配置
 */
export interface ReviewSessionConfig {
  /** 单次复习最大题数（默认 5 题） */
  maxQuestions?: number;

  /** 优先复习即将过期的题目 */
  prioritizeUrgent?: boolean;

  /** 筛选错误类型 */
  filterErrorType?: ErrorType;

  /** 筛选难度 */
  filterDifficulty?: Difficulty;

  /** 筛选关卡 */
  filterLevel?: string;
}

/**
 * 复习会话结果
 */
export interface ReviewSessionResult {
  /** 会话 ID */
  sessionId: string;

  /** 复习题目数量 */
  totalQuestions: number;

  /** 正确数量 */
  correctCount: number;

  /** 掌握的题目数量 */
  masteredCount: number;

  /** 总用时（秒） */
  totalTimeSpent: number;

  /** 得分 */
  score: number;

  /** 获得的成就 */
  achievements: string[];
}

/**
 * LocalStorage 键名常量
 */
export const STORAGE_KEYS = {
  /** 错题本数据 */
  MISTAKE_BOOK: 'childMath_mistakeBook',
  /** 用户设置 */
  USER_SETTINGS: 'childMath_settings',
  /** 关卡进度（凑十法） */
  LEVEL_PROGRESS: 'childMath_levelProgress',
  /** 成就系统 */
  ACHIEVEMENTS: 'childMath_achievements',
} as const;
