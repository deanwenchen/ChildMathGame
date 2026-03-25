import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import {
  PKRoom,
  PKPlayer,
  PKMessage,
  PKMessageType,
  PKMatchRequest,
  PKResult,
  PKQuestion,
  DEFAULT_PK_CONFIG,
  PK_DIFFICULTY_CONFIG
} from '../types/pk.types';
import questionGenerator from './QuestionGenerator.service';
import LeaderboardService from './Leaderboard.service';
import UserModel from '../models/User.model';

/**
 * WebSocket连接信息
 */
interface WebSocketConnection {
  ws: WebSocket;
  userId: number;
  username: string;
  roomId: string | null;
  lastPing: number;
}

/**
 * PKWebSocketService - PK对战WebSocket服务
 *
 * 功能:
 * - WebSocket连接管理
 * - 玩家匹配
 * - 房间管理
 * - 题目同步
 * - 实时答题结果推送
 */
export class PKWebSocketService {
  private static instance: PKWebSocketService;
  private wss: WebSocketServer | null = null;
  private connections: Map<string, WebSocketConnection> = new Map();
  private rooms: Map<string, PKRoom> = new Map();
  private userRoomMap: Map<number, string> = new Map(); // userId -> roomId
  private matchingQueue: Map<string, PKMatchRequest> = new Map(); // websocketId -> request
  private matchmakingInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): PKWebSocketService {
    if (!PKWebSocketService.instance) {
      PKWebSocketService.instance = new PKWebSocketService();
    }
    return PKWebSocketService.instance;
  }

  /**
   * 初始化WebSocket服务器
   */
  initialize(server: http.Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws/pk' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const websocketId = this.generateWebSocketId();
      console.log(`[PK-WS] 新连接: ${websocketId}`);

      // 临时存储连接
      (ws as any).id = websocketId;

      ws.on('message', (data: string) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error(`[PK-WS] 连接错误: ${websocketId}`, error.message);
        this.handleDisconnect(ws);
      });

      // 发送连接确认
      this.sendMessage(ws, 'connected', { websocketId });
    });

    // 启动匹配循环
    this.startMatchmaking();

    console.log('[PK-WS] WebSocket服务器已启动');
  }

  /**
   * 处理接收的消息
   */
  private handleMessage(ws: WebSocket, data: string): void {
    try {
      const message: PKMessage = JSON.parse(data);
      const websocketId = (ws as any).id;
      const connection = this.connections.get(websocketId);

      switch (message.type) {
        case 'ping':
          this.handlePing(ws, message);
          break;

        case 'match_request':
          this.handleMatchRequest(ws, message.payload);
          break;

        case 'cancel_match':
          this.handleCancelMatch(websocketId);
          break;

        case 'ready':
          if (connection) {
            this.handlePlayerReady(connection.userId);
          }
          break;

        case 'answer':
          if (connection) {
            this.handleAnswer(connection.userId, message.payload);
          }
          break;

        case 'join_room':
          this.handleJoinRoom(ws, message.payload);
          break;

        default:
          console.log(`[PK-WS] 未知消息类型: ${message.type}`);
      }
    } catch (error) {
      console.error('[PK-WS] 解析消息失败:', error);
      this.sendMessage(ws, 'error', { message: '消息格式错误' });
    }
  }

  /**
   * 处理心跳
   */
  private handlePing(ws: WebSocket, message: PKMessage): void {
    const websocketId = (ws as any).id;
    const connection = this.connections.get(websocketId);
    if (connection) {
      connection.lastPing = Date.now();
    }
    this.sendMessage(ws, 'pong', { timestamp: Date.now() });
  }

  /**
   * 处理匹配请求
   */
  private handleMatchRequest(ws: WebSocket, payload: PKMatchRequest): void {
    const websocketId = (ws as any).id;

    // 检查是否已在匹配队列或房间中
    if (this.matchingQueue.has(websocketId)) {
      this.sendMessage(ws, 'error', { message: '已在匹配队列中' });
      return;
    }

    if (this.userRoomMap.has(payload.userId)) {
      this.sendMessage(ws, 'error', { message: '已在游戏中' });
      return;
    }

    // 存储连接信息
    this.connections.set(websocketId, {
      ws,
      userId: payload.userId,
      username: payload.username,
      roomId: null,
      lastPing: Date.now()
    });

    // 添加到匹配队列
    this.matchingQueue.set(websocketId, {
      ...payload,
      websocketId
    });

    console.log(`[PK-WS] 玩家加入匹配: ${payload.username} (${payload.difficulty})`);

    this.sendMessage(ws, 'match_request', {
      status: 'searching',
      message: '正在寻找对手...'
    });
  }

  /**
   * 处理取消匹配
   */
  private handleCancelMatch(websocketId: string): void {
    this.matchingQueue.delete(websocketId);
    const connection = this.connections.get(websocketId);
    if (connection) {
      console.log(`[PK-WS] 玩家取消匹配: ${connection.username}`);
      this.sendMessage(connection.ws, 'match_cancelled', { message: '已取消匹配' });
    }
  }

  /**
   * 处理玩家准备
   */
  private handlePlayerReady(userId: number): void {
    const roomId = this.userRoomMap.get(userId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.isReady = true;
    }

    // 检查所有玩家是否都准备好了
    if (room.players.every(p => p.isReady)) {
      this.startGame(roomId);
    }
  }

  /**
   * 处理答题
   */
  private handleAnswer(userId: number, payload: {
    questionId: string;
    answer: number;
    timeSpent: number;
  }): void {
    const roomId = this.userRoomMap.get(userId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'playing') return;

    const player = room.players.find(p => p.userId === userId);
    if (!player) return;

    const question = room.questions[room.currentQuestionIndex];
    if (!question || question.id !== payload.questionId) return;

    // 检查是否已经答过这题
    const existingAnswer = player.answers.find(a => a.questionId === payload.questionId);
    if (existingAnswer) return;

    const isCorrect = payload.answer === question.answer;

    // 记录答案
    player.answers.push({
      questionId: payload.questionId,
      userAnswer: payload.answer,
      correctAnswer: question.answer,
      isCorrect,
      timeSpent: payload.timeSpent,
      answeredAt: Date.now()
    });

    if (isCorrect) {
      player.correctCount++;
      // 计算得分（考虑时间和连击）
      const baseScore = 100;
      const timeBonus = Math.max(0, Math.floor((room.config.timePerQuestion * 1000 - payload.timeSpent) / 100));
      player.score += baseScore + timeBonus;
    } else {
      player.wrongCount++;
    }

    // 发送答题结果给当前玩家
    const connection = this.getConnectionByUserId(userId);
    if (connection) {
      this.sendMessage(connection.ws, 'answer_result', {
        questionId: payload.questionId,
        isCorrect,
        correctAnswer: question.answer,
        yourScore: player.score,
        yourCorrectCount: player.correctCount
      });
    }

    // 广播给对手
    this.broadcastToRoom(roomId, 'opponent_answer', {
      userId,
      questionId: payload.questionId,
      isCorrect,
      opponentScore: player.score
    }, userId);

    // 检查是否所有玩家都答完了这题
    this.checkQuestionComplete(roomId);
  }

  /**
   * 检查当前题目是否完成
   */
  private checkQuestionComplete(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const allAnswered = room.players.every(p =>
      p.answers.some(a => a.questionId === room.questions[room.currentQuestionIndex]?.id)
    );

    if (allAnswered || this.isQuestionTimeout(roomId)) {
      this.nextQuestion(roomId);
    }
  }

  /**
   * 检查题目是否超时
   */
  private isQuestionTimeout(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || !room.questions[room.currentQuestionIndex]) return true;

    const question = room.questions[room.currentQuestionIndex];
    if (!question.sentAt) return true;

    const elapsed = Date.now() - question.sentAt;
    return elapsed >= room.config.timePerQuestion * 1000;
  }

  /**
   * 下一题
   */
  private nextQuestion(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.currentQuestionIndex++;

    // 检查游戏是否结束
    if (room.currentQuestionIndex >= room.questions.length) {
      this.endGame(roomId);
      return;
    }

    // 发送下一题
    this.sendQuestion(roomId);
  }

  /**
   * 发送题目
   */
  private sendQuestion(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const question = room.questions[room.currentQuestionIndex];
    question.sentAt = Date.now();

    const questionData = {
      index: room.currentQuestionIndex,
      total: room.questions.length,
      question: {
        id: question.id,
        expression: question.expression,
        difficulty: question.difficulty,
        timeLimit: room.config.timePerQuestion
      }
    };

    this.broadcastToRoom(roomId, 'question', questionData);
  }

  /**
   * 开始游戏
   */
  private startGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'playing';
    room.startedAt = Date.now();
    room.currentQuestionIndex = 0;

    console.log(`[PK-WS] 游戏开始: ${roomId}`);

    // 发送倒计时
    this.broadcastToRoom(roomId, 'game_start', {
      roomId,
      players: room.players.map(p => ({
        userId: p.userId,
        username: p.username
      })),
      totalQuestions: room.questions.length,
      timePerQuestion: room.config.timePerQuestion
    });

    // 延迟发送第一题
    setTimeout(() => {
      this.sendQuestion(roomId);
    }, 2000);
  }

  /**
   * 结束游戏
   */
  private endGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'finished';
    room.finishedAt = Date.now();

    // 确定胜者
    const [player1, player2] = room.players;
    if (player1.score > player2.score) {
      room.winner = player1.userId;
    } else if (player2.score > player1.score) {
      room.winner = player2.userId;
    }

    // 计算结果
    const result: PKResult = {
      roomId,
      winner: room.winner || null,
      players: room.players.map(p => ({
        userId: p.userId,
        username: p.username,
        score: p.score,
        correctCount: p.correctCount,
        wrongCount: p.wrongCount,
        avgTime: this.calculateAvgTime(p)
      })),
      finishedAt: room.finishedAt
    };

    console.log(`[PK-WS] 游戏结束: ${roomId}, 胜者: ${room.winner || '平局'}`);

    // 广播结果
    this.broadcastToRoom(roomId, 'game_over', result);

    // 更新排行榜积分
    if (room.winner) {
      const winner = room.players.find(p => p.userId === room.winner);
      const loser = room.players.find(p => p.userId !== room.winner);
      if (winner && loser) {
        const margin = winner.correctCount - loser.correctCount;
        LeaderboardService.handlePKWin(winner.userId, winner.username, margin);
      }
    }

    // 清理房间（延迟）
    setTimeout(() => {
      this.cleanupRoom(roomId);
    }, 30000);
  }

  /**
   * 计算平均答题时间
   */
  private calculateAvgTime(player: PKPlayer): number {
    if (player.answers.length === 0) return 0;
    const totalTime = player.answers.reduce((sum, a) => sum + a.timeSpent, 0);
    return Math.round(totalTime / player.answers.length);
  }

  /**
   * 处理加入房间（好友对战）
   */
  private handleJoinRoom(ws: WebSocket, payload: { roomId: string; userId: number; username: string }): void {
    const room = this.rooms.get(payload.roomId);
    if (!room) {
      this.sendMessage(ws, 'error', { message: '房间不存在' });
      return;
    }

    if (room.players.length >= 2) {
      this.sendMessage(ws, 'error', { message: '房间已满' });
      return;
    }

    const websocketId = (ws as any).id;

    // 存储连接信息
    this.connections.set(websocketId, {
      ws,
      userId: payload.userId,
      username: payload.username,
      roomId: payload.roomId,
      lastPing: Date.now()
    });

    this.userRoomMap.set(payload.userId, payload.roomId);

    // 添加玩家
    const player: PKPlayer = {
      userId: payload.userId,
      username: payload.username,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      currentQuestionIndex: 0,
      answers: [],
      isReady: false,
      connected: true
    };

    room.players.push(player);

    this.sendMessage(ws, 'room_joined', {
      roomId: payload.roomId,
      players: room.players.map(p => ({ userId: p.userId, username: p.username }))
    });

    this.broadcastToRoom(payload.roomId, 'player_joined', {
      userId: payload.userId,
      username: payload.username
    });

    // 如果房间满了，开始倒计时
    if (room.players.length === 2) {
      this.startCountdown(payload.roomId);
    }
  }

  /**
   * 开始倒计时
   */
  private startCountdown(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'countdown';
    let countdown = 3;

    const countdownInterval = setInterval(() => {
      this.broadcastToRoom(roomId, 'countdown', { countdown });

      countdown--;
      if (countdown < 0) {
        clearInterval(countdownInterval);
        this.startGame(roomId);
      }
    }, 1000);
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect(ws: WebSocket): void {
    const websocketId = (ws as any).id;
    const connection = this.connections.get(websocketId);

    if (connection) {
      console.log(`[PK-WS] 断开连接: ${connection.username}`);

      // 从匹配队列移除
      this.matchingQueue.delete(websocketId);

      // 处理房间中断
      if (connection.roomId) {
        this.handlePlayerDisconnect(connection.userId, connection.roomId);
      }

      this.connections.delete(websocketId);
    }
  }

  /**
   * 处理玩家断开连接（游戏中）
   */
  private handlePlayerDisconnect(userId: number, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.status === 'playing') {
      // 判断对手获胜
      const remainingPlayer = room.players.find(p => p.userId !== userId);
      if (remainingPlayer) {
        room.winner = remainingPlayer.userId;
        room.status = 'finished';
        room.finishedAt = Date.now();

        this.broadcastToRoom(roomId, 'game_over', {
          roomId,
          winner: room.winner,
          reason: 'opponent_disconnected',
          message: '对手断开连接，你获胜了！'
        });

        // 更新积分
        LeaderboardService.handlePKWin(remainingPlayer.userId, remainingPlayer.username, 1);
      }
    }

    this.userRoomMap.delete(userId);
  }

  /**
   * 启动匹配循环
   */
  private startMatchmaking(): void {
    this.matchmakingInterval = setInterval(() => {
      this.processMatchmaking();
    }, 1000);
  }

  /**
   * 处理匹配
   */
  private processMatchmaking(): void {
    const queueArray = Array.from(this.matchingQueue.values());

    // 按难度分组
    const difficultyGroups: Record<string, PKMatchRequest[]> = {
      easy: [],
      medium: [],
      hard: []
    };

    for (const request of queueArray) {
      difficultyGroups[request.difficulty].push(request);
    }

    // 尝试匹配
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const group = difficultyGroups[difficulty];
      while (group.length >= 2) {
        const [player1, player2] = group.splice(0, 2);
        this.createRoom(player1, player2, difficulty);
      }
    }
  }

  /**
   * 创建房间
   */
  private createRoom(player1: PKMatchRequest, player2: PKMatchRequest, difficulty: 'easy' | 'medium' | 'hard'): void {
    const roomId = this.generateRoomId();
    const config = {
      ...DEFAULT_PK_CONFIG,
      ...PK_DIFFICULTY_CONFIG[difficulty],
      difficulty
    };

    // 生成题目
    const questions: PKQuestion[] = [];
    for (let i = 0; i < config.totalQuestions; i++) {
      const opType = config.operationTypes[Math.floor(Math.random() * config.operationTypes.length)];
      const q = questionGenerator.generateQuestion(difficulty, opType);
      questions.push({
        id: q.id,
        expression: q.expression,
        answer: q.answer,
        difficulty: q.difficulty,
        operationType: q.operationType
      });
    }

    const room: PKRoom = {
      roomId,
      players: [
        {
          userId: player1.userId,
          username: player1.username,
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          currentQuestionIndex: 0,
          answers: [],
          isReady: false,
          connected: true
        },
        {
          userId: player2.userId,
          username: player2.username,
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          currentQuestionIndex: 0,
          answers: [],
          isReady: false,
          connected: true
        }
      ],
      questions,
      config,
      status: 'waiting',
      currentQuestionIndex: 0,
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);

    // 更新连接信息
    const conn1 = this.connections.get(player1.websocketId);
    const conn2 = this.connections.get(player2.websocketId);

    if (conn1) {
      conn1.roomId = roomId;
      this.userRoomMap.set(player1.userId, roomId);
    }
    if (conn2) {
      conn2.roomId = roomId;
      this.userRoomMap.set(player2.userId, roomId);
    }

    // 从匹配队列移除
    this.matchingQueue.delete(player1.websocketId);
    this.matchingQueue.delete(player2.websocketId);

    console.log(`[PK-WS] 创建房间: ${roomId} (${player1.username} vs ${player2.username})`);

    // 通知匹配成功
    this.sendMessage(conn1?.ws!, 'match_found', {
      roomId,
      opponent: { userId: player2.userId, username: player2.username },
      difficulty
    });
    this.sendMessage(conn2?.ws!, 'match_found', {
      roomId,
      opponent: { userId: player1.userId, username: player1.username },
      difficulty
    });

    // 自动开始倒计时
    setTimeout(() => {
      this.startCountdown(roomId);
    }, 1000);
  }

  /**
   * 清理房间
   */
  private cleanupRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      for (const player of room.players) {
        this.userRoomMap.delete(player.userId);
      }
      this.rooms.delete(roomId);
      console.log(`[PK-WS] 清理房间: ${roomId}`);
    }
  }

  /**
   * 发送消息
   */
  private sendMessage(ws: WebSocket, type: PKMessageType | 'connected' | 'match_cancelled' | 'room_joined', payload: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type,
        payload,
        timestamp: Date.now()
      }));
    }
  }

  /**
   * 广播消息到房间
   */
  private broadcastToRoom(roomId: string, type: PKMessageType, payload: any, excludeUserId?: number): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const player of room.players) {
      if (excludeUserId && player.userId === excludeUserId) continue;

      const connection = this.getConnectionByUserId(player.userId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(connection.ws, type, payload);
      }
    }
  }

  /**
   * 根据用户ID获取连接
   */
  private getConnectionByUserId(userId: number): WebSocketConnection | undefined {
    for (const conn of this.connections.values()) {
      if (conn.userId === userId) {
        return conn;
      }
    }
    return undefined;
  }

  /**
   * 生成WebSocket ID
   */
  private generateWebSocketId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成房间ID
   */
  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * 获取房间信息
   */
  getRoom(roomId: string): PKRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * 获取用户当前房间
   */
  getUserRoom(userId: number): PKRoom | undefined {
    const roomId = this.userRoomMap.get(userId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  /**
   * 创建好友对战房间
   */
  createFriendRoom(hostId: number, hostName: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): string {
    const roomId = this.generateRoomId();
    const config = {
      ...DEFAULT_PK_CONFIG,
      ...PK_DIFFICULTY_CONFIG[difficulty],
      difficulty
    };

    // 生成题目
    const questions: PKQuestion[] = [];
    for (let i = 0; i < config.totalQuestions; i++) {
      const opType = config.operationTypes[Math.floor(Math.random() * config.operationTypes.length)];
      const q = questionGenerator.generateQuestion(difficulty, opType);
      questions.push({
        id: q.id,
        expression: q.expression,
        answer: q.answer,
        difficulty: q.difficulty,
        operationType: q.operationType
      });
    }

    const room: PKRoom = {
      roomId,
      players: [
        {
          userId: hostId,
          username: hostName,
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          currentQuestionIndex: 0,
          answers: [],
          isReady: false,
          connected: true
        }
      ],
      questions,
      config,
      status: 'waiting',
      currentQuestionIndex: 0,
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    this.userRoomMap.set(hostId, roomId);

    console.log(`[PK-WS] 创建好友房间: ${roomId} by ${hostName}`);

    return roomId;
  }

  /**
   * 关闭服务
   */
  close(): void {
    if (this.matchmakingInterval) {
      clearInterval(this.matchmakingInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
    console.log('[PK-WS] 服务已关闭');
  }
}

export default PKWebSocketService.getInstance();