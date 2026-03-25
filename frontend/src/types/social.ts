// 社交功能类型定义

// 用户在线状态
export type UserStatus = 'online' | 'offline' | 'in_game';

// 扩展用户信息（社交相关）
export interface SocialUser {
  id: number;
  username: string;
  avatar: string;
  status: UserStatus;
  totalPoints: number;
  currentStreak: number;
  todayCorrect: number;
  lastActiveAt?: string;
}

// 好友关系状态
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

// 好友关系
export interface Friendship {
  id: number;
  requesterId: number;
  responderId: number;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

// 好友请求
export interface FriendRequest {
  id: number;
  user: SocialUser;
  status: 'pending';
  createdAt: string;
}

// 好友信息（包含详情）
export interface Friend extends SocialUser {
  friendshipId: number;
  friendSince: string;
}

// 加油类型
export type CheerType = 'encourage' | 'celebrate' | 'good_luck';

// 加油消息预设
export const CHEER_PRESETS: { type: CheerType; message: string; emoji: string }[] = [
  { type: 'encourage', message: '加油!', emoji: '💪' },
  { type: 'encourage', message: '你可以的!', emoji: '🎯' },
  { type: 'celebrate', message: '太棒了!', emoji: '⭐' },
  { type: 'celebrate', message: '你真厉害!', emoji: '🎉' },
  { type: 'good_luck', message: '祝你成功!', emoji: '🍀' },
];

// 加油消息
export interface Cheer {
  id: number;
  senderId: number;
  sender: SocialUser;
  receiverId: number;
  type: CheerType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// 排行榜周期
export type LeaderboardPeriod = 'weekly' | 'monthly';

// 排行榜条目
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  user: SocialUser;
  totalPoints: number;
  totalCorrect: number;
  totalTime: number;
}

// 我的排名信息
export interface MyRankInfo {
  rank: number;
  totalPoints: number;
  totalCorrect: number;
  totalTime: number;
}

// PK对战状态
export type PKMatchStatus = 'waiting' | 'matched' | 'playing' | 'completed' | 'cancelled';

// PK对战题目
export interface PKQuestion {
  id: string;
  expression: string;
  answer: number;
  options: number[];
}

// PK对战回合结果
export interface PKRoundResult {
  round: number;
  question: PKQuestion;
  myAnswer?: number;
  opponentAnswer?: number;
  myTime?: number;
  opponentTime?: number;
  myCorrect: boolean;
  opponentCorrect: boolean;
}

// PK对战
export interface PKMatch {
  id: number;
  roomCode: string;
  status: PKMatchStatus;
  player1: SocialUser;
  player2: SocialUser | null;
  currentRound: number;
  totalRounds: number;
  myScore: number;
  opponentScore: number;
  myCorrect: number;
  opponentCorrect: number;
  winnerId?: number;
  questions: PKQuestion[];
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

// PK对战历史
export interface PKMatchHistory {
  id: number;
  opponent: SocialUser;
  result: 'win' | 'lose' | 'draw';
  myScore: number;
  opponentScore: number;
  createdAt: string;
}

// PK对战统计
export interface PKStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalPoints: number;
}

// 学习小组
export interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  avatar: string;
  creatorId: number;
  inviteCode: string;
  maxMembers: number;
  memberCount: number;
  isPublic: boolean;
  status: 'active' | 'disbanded';
  todayPracticeCount: number;
  createdAt: string;
}

// 小组成员角色
export type GroupMemberRole = 'leader' | 'admin' | 'member';

// 小组成员
export interface GroupMember {
  userId: number;
  user: SocialUser;
  role: GroupMemberRole;
  joinedAt: string;
}

// 社交功能Context类型
export interface SocialContextType {
  // 好友相关
  friends: Friend[];
  friendRequests: FriendRequest[];
  onlineFriends: Friend[];
  fetchFriends: () => Promise<void>;
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (id: number) => Promise<void>;
  rejectFriendRequest: (id: number) => Promise<void>;
  removeFriend: (id: number) => Promise<void>;

  // 加油相关
  cheers: Cheer[];
  unreadCheerCount: number;
  sendCheer: (receiverId: number, type: CheerType, message: string) => Promise<void>;
  markCheerRead: (id: number) => void;

  // 排行榜相关
  leaderboard: LeaderboardEntry[];
  myRank: MyRankInfo | null;
  leaderboardPeriod: LeaderboardPeriod;
  setLeaderboardPeriod: (period: LeaderboardPeriod) => void;
  fetchLeaderboard: (period: LeaderboardPeriod) => Promise<void>;

  // PK相关
  currentMatch: PKMatch | null;
  matchStatus: 'idle' | 'searching' | 'playing' | 'ended';
  startMatchmaking: () => void;
  cancelMatchmaking: () => void;
  submitAnswer: (answer: number) => void;

  // 小组相关
  groups: StudyGroup[];
  fetchGroups: () => Promise<void>;
  createGroup: (data: { name: string; description?: string; isPublic: boolean }) => Promise<void>;
  joinGroup: (inviteCode: string) => Promise<void>;
  leaveGroup: (groupId: number) => Promise<void>;

  // WebSocket状态
  socketConnected: boolean;
}