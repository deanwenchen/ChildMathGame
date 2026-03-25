/**
 * PK对战类型定义
 */

/**
 * PK房间状态
 */
export type PKRoomStatus = 'waiting' | 'countdown' | 'playing' | 'finished';

/**
 * PK玩家状态
 */
export interface PKPlayer {
  userId: number;
  username: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  currentQuestionIndex: number;
  answers: PKAnswer[];
  isReady: boolean;
  connected: boolean;
}

/**
 * PK答题记录
 */
export interface PKAnswer {
  questionId: string;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // 毫秒
  answeredAt: number; // 时间戳
}

/**
 * PK房间配置
 */
export interface PKRoomConfig {
  totalQuestions: number; // 总题数
  timePerQuestion: number; // 每题时间（秒）
  difficulty: 'easy' | 'medium' | 'hard';
  operationTypes: ('addition' | 'subtraction' | 'multiplication' | 'division')[];
}

/**
 * PK房间
 */
export interface PKRoom {
  roomId: string;
  players: PKPlayer[];
  questions: PKQuestion[];
  config: PKRoomConfig;
  status: PKRoomStatus;
  currentQuestionIndex: number;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  winner?: number; // userId
}

/**
 * PK题目（带时间戳）
 */
export interface PKQuestion {
  id: string;
  expression: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  operationType: 'addition' | 'subtraction' | 'multiplication' | 'division';
  sentAt?: number; // 题目发送时间
}

/**
 * PK匹配请求
 */
export interface PKMatchRequest {
  userId: number;
  username: string;
  difficulty: 'easy' | 'medium' | 'hard';
  websocketId: string;
}

/**
 * PK结果
 */
export interface PKResult {
  roomId: string;
  winner: number | null; // null 表示平局
  players: Array<{
    userId: number;
    username: string;
    score: number;
    correctCount: number;
    wrongCount: number;
    avgTime: number;
  }>;
  finishedAt: number;
}

/**
 * WebSocket消息类型
 */
export type PKMessageType =
  | 'match_request'
  | 'match_found'
  | 'match_cancelled'
  | 'cancel_match'
  | 'room_created'
  | 'room_joined'
  | 'player_joined'
  | 'player_left'
  | 'game_start'
  | 'countdown'
  | 'question'
  | 'answer'
  | 'answer_result'
  | 'opponent_answer'
  | 'game_over'
  | 'error'
  | 'ping'
  | 'pong'
  | 'ready'
  | 'join_room'
  | 'connected';

/**
 * WebSocket消息
 */
export interface PKMessage {
  type: PKMessageType;
  payload: any;
  timestamp: number;
}

/**
 * 默认PK配置
 */
export const DEFAULT_PK_CONFIG: PKRoomConfig = {
  totalQuestions: 10,
  timePerQuestion: 15,
  difficulty: 'medium',
  operationTypes: ['addition', 'subtraction', 'multiplication', 'division']
};

/**
 * PK难度配置
 */
export const PK_DIFFICULTY_CONFIG = {
  easy: {
    totalQuestions: 10,
    timePerQuestion: 20,
    pointsMultiplier: 1
  },
  medium: {
    totalQuestions: 10,
    timePerQuestion: 15,
    pointsMultiplier: 1.5
  },
  hard: {
    totalQuestions: 15,
    timePerQuestion: 12,
    pointsMultiplier: 2
  }
};