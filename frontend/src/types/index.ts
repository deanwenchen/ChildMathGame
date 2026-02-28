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
