import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import axios from 'axios';
import {
  Friend,
  FriendRequest,
  Cheer,
  CheerType,
  LeaderboardEntry,
  MyRankInfo,
  LeaderboardPeriod,
  SocialContextType,
} from '../types/social';
import { useGame } from './GameContext';

const SocialContext = createContext<SocialContextType | undefined>(undefined);

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * 社交功能状态管理 Context
 * 管理好友、排行榜、加油消息等社交功能状态
 */
export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useGame();

  // 好友相关状态
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  // 加油相关状态
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [unreadCheerCount, setUnreadCheerCount] = useState(0);

  // 排行榜相关状态
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRankInfo | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('weekly');

  // PK相关状态
  const [currentMatch, setCurrentMatch] = useState<SocialContextType['currentMatch']>(null);
  const [matchStatus, setMatchStatus] = useState<SocialContextType['matchStatus']>('idle');

  // 小组相关状态
  const [groups, setGroups] = useState<SocialContextType['groups']>([]);

  // WebSocket状态
  const [socketConnected] = useState(false);

  // 计算在线好友
  const onlineFriends = friends.filter(f => f.status === 'online');

  // 获取好友列表
  const fetchFriends = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/friends`, {
        params: { userId: currentUser.id },
      });
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('获取好友列表失败:', error);
      // 使用模拟数据用于开发
      setFriends([]);
    }
  }, [currentUser]);

  // 获取好友请求
  const fetchFriendRequests = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/friends/requests`, {
        params: { userId: currentUser.id },
      });
      setFriendRequests(response.data.requests || []);
    } catch (error) {
      console.error('获取好友请求失败:', error);
      setFriendRequests([]);
    }
  }, [currentUser]);

  // 发送好友请求
  const sendFriendRequest = useCallback(async (username: string) => {
    if (!currentUser) throw new Error('请先登录');
    try {
      await axios.post(`${API_BASE_URL}/friends/request`, {
        requesterId: currentUser.id,
        username,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '发送请求失败');
    }
  }, [currentUser]);

  // 接受好友请求
  const acceptFriendRequest = useCallback(async (requestId: number) => {
    if (!currentUser) throw new Error('请先登录');
    try {
      await axios.post(`${API_BASE_URL}/friends/accept`, {
        userId: currentUser.id,
        requestId,
      });
      // 刷新好友列表和请求列表
      await fetchFriends();
      await fetchFriendRequests();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '接受请求失败');
    }
  }, [currentUser, fetchFriends, fetchFriendRequests]);

  // 拒绝好友请求
  const rejectFriendRequest = useCallback(async (requestId: number) => {
    if (!currentUser) throw new Error('请先登录');
    try {
      await axios.post(`${API_BASE_URL}/friends/reject`, {
        userId: currentUser.id,
        requestId,
      });
      await fetchFriendRequests();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '拒绝请求失败');
    }
  }, [currentUser, fetchFriendRequests]);

  // 删除好友
  const removeFriend = useCallback(async (friendshipId: number) => {
    if (!currentUser) throw new Error('请先登录');
    try {
      await axios.delete(`${API_BASE_URL}/friends/${friendshipId}`, {
        params: { userId: currentUser.id },
      });
      await fetchFriends();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除好友失败');
    }
  }, [currentUser, fetchFriends]);

  // 发送加油消息
  const sendCheer = useCallback(async (receiverId: number, type: CheerType, message: string) => {
    if (!currentUser) throw new Error('请先登录');
    try {
      await axios.post(`${API_BASE_URL}/friends/cheer`, {
        senderId: currentUser.id,
        receiverId,
        type,
        message,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '发送加油失败');
    }
  }, [currentUser]);

  // 标记加油消息已读
  const markCheerRead = useCallback((cheerId: number) => {
    setCheers(prev => prev.map(c => c.id === cheerId ? { ...c, isRead: true } : c));
    setUnreadCheerCount(prev => Math.max(0, prev - 1));
  }, []);

  // 获取排行榜
  const fetchLeaderboard = useCallback(async (period: LeaderboardPeriod) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard`, {
        params: { period },
      });
      setLeaderboard(response.data.leaderboard || []);
      setMyRank(response.data.myRank || null);
    } catch (error) {
      console.error('获取排行榜失败:', error);
      // 使用模拟数据用于开发
      const mockLeaderboard: LeaderboardEntry[] = [
        { rank: 1, userId: 1, user: { id: 1, username: '小明', avatar: '', status: 'online', totalPoints: 1250, currentStreak: 15, todayCorrect: 25 }, totalPoints: 1250, totalCorrect: 156, totalTime: 3200 },
        { rank: 2, userId: 2, user: { id: 2, username: '小红', avatar: '', status: 'offline', totalPoints: 980, currentStreak: 12, todayCorrect: 18 }, totalPoints: 980, totalCorrect: 132, totalTime: 2800 },
        { rank: 3, userId: 3, user: { id: 3, username: '小刚', avatar: '', status: 'online', totalPoints: 856, currentStreak: 8, todayCorrect: 22 }, totalPoints: 856, totalCorrect: 98, totalTime: 2400 },
        { rank: 4, userId: 4, user: { id: 4, username: '小美', avatar: '', status: 'in_game', totalPoints: 720, currentStreak: 5, todayCorrect: 15 }, totalPoints: 720, totalCorrect: 85, totalTime: 2100 },
        { rank: 5, userId: 5, user: { id: 5, username: '小华', avatar: '', status: 'online', totalPoints: 650, currentStreak: 6, todayCorrect: 12 }, totalPoints: 650, totalCorrect: 76, totalTime: 1800 },
      ];
      setLeaderboard(mockLeaderboard);
      if (currentUser) {
        setMyRank({ rank: 6, totalPoints: 520, totalCorrect: 65, totalTime: 1500 });
      }
    }
  }, [currentUser]);

  // 开始PK匹配
  const startMatchmaking = useCallback(() => {
    if (!currentUser) return;
    setMatchStatus('searching');
    // TODO: 实现WebSocket匹配逻辑
  }, [currentUser]);

  // 取消PK匹配
  const cancelMatchmaking = useCallback(() => {
    setMatchStatus('idle');
    setCurrentMatch(null);
  }, []);

  // 提交PK答案
  const submitAnswer = useCallback((answer: number) => {
    // TODO: 实现WebSocket提交答案逻辑
    console.log('Submit answer:', answer);
  }, []);

  // 获取小组列表
  const fetchGroups = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/groups`, {
        params: { userId: currentUser.id },
      });
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('获取小组列表失败:', error);
      setGroups([]);
    }
  }, [currentUser]);

  // 创建小组
  const createGroup = useCallback(async (data: { name: string; description?: string; isPublic: boolean }) => {
    if (!currentUser) throw new Error('请先登录');
    try {
      await axios.post(`${API_BASE_URL}/groups`, {
        creatorId: currentUser.id,
        ...data,
      });
      await fetchGroups();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建小组失败');
    }
  }, [currentUser, fetchGroups]);

  // 加入小组
  const joinGroup = useCallback(async (inviteCode: string) => {
    if (!currentUser) throw new Error('请先登录');
    try {
      await axios.post(`${API_BASE_URL}/groups/join`, {
        userId: currentUser.id,
        inviteCode,
      });
      await fetchGroups();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '加入小组失败');
    }
  }, [currentUser, fetchGroups]);

  // 退出小组
  const leaveGroup = useCallback(async (groupId: number) => {
    if (!currentUser) throw new Error('请先登录');
    try {
      await axios.post(`${API_BASE_URL}/groups/leave`, {
        userId: currentUser.id,
        groupId,
      });
      await fetchGroups();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '退出小组失败');
    }
  }, [currentUser, fetchGroups]);

  // 初始化数据
  useEffect(() => {
    if (currentUser) {
      fetchFriends();
      fetchFriendRequests();
      fetchLeaderboard(leaderboardPeriod);
      fetchGroups();
    }
  }, [currentUser, fetchFriends, fetchFriendRequests, fetchLeaderboard, leaderboardPeriod, fetchGroups]);

  const value: SocialContextType = {
    friends,
    friendRequests,
    onlineFriends,
    fetchFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,

    cheers,
    unreadCheerCount,
    sendCheer,
    markCheerRead,

    leaderboard,
    myRank,
    leaderboardPeriod,
    setLeaderboardPeriod,
    fetchLeaderboard,

    currentMatch,
    matchStatus,
    startMatchmaking,
    cancelMatchmaking,
    submitAnswer,

    groups,
    fetchGroups,
    createGroup,
    joinGroup,
    leaveGroup,

    socketConnected,
  };

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

export default SocialContext;