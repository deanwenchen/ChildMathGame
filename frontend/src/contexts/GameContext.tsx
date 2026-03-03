import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, Score } from '../types';
import { Achievement } from '../utils/achievements';

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 配置 axios
axios.defaults.baseURL = API_BASE_URL;

export interface GameContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string) => Promise<User | null>;
  logout: () => void;
  submitScore: (scoreData: Omit<Score, 'id' | 'created_at'>) => Promise<void>;
  getScores: (userId: number) => Promise<Score[]>;
  // 连击状态
  comboCount: number;
  setComboCount: (count: number) => void;
  resetCombo: () => void;
  incrementCombo: () => void;
  // 成就状态
  unlockedAchievements: Achievement[];
  addAchievement: (achievement: Achievement) => void;
  clearAchievements: () => void;
  // 音效设置
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  // 连击状态
  const [comboCount, setComboCount] = useState(0);
  // 成就状态
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  // 音效设置
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  // 初始化：从 localStorage 加载用户
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUserState(JSON.parse(savedUser));
    }
  }, []);

  // 持久化音效设置
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // 保存用户到 localStorage
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  // 登录/注册用户
  const login = async (username: string): Promise<User | null> => {
    try {
      console.log('[GameContext] 开始登录，username:', username);

      // 首先尝试获取现有用户
      let user = await getUserByUsername(username);
      console.log('[GameContext] getUserByUsername 结果:', user);

      if (!user) {
        // 如果用户不存在，创建新用户
        // 默认值：年龄 8 岁，年级 2 年级（可根据实际情况调整）
        console.log('[GameContext] 用户不存在，创建新用户...');
        const response = await axios.post('/users', {
          username,
          age: 8,
          grade: 2
        });
        console.log('[GameContext] 创建用户响应:', response.data);
        user = response.data.user;
      }

      if (!user) {
        console.log('[GameContext] 登录失败：user 为 null');
        return null;
      }

      console.log('[GameContext] 登录成功，设置 currentUser:', user);
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('[GameContext] 登录失败:', error);
      throw error;
    }
  };

  // 获取用户信息
  const getUserByUsername = async (username: string): Promise<User | null> => {
    try {
      const response = await axios.get('/users');
      const users: User[] = response.data.users;
      return users.find(u => u.username === username) || null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  };

  // 登出
  const logout = () => {
    setCurrentUser(null);
  };

  // 连击操作
  const resetCombo = () => setComboCount(0);
  const incrementCombo = () => setComboCount(prev => prev + 1);

  // 成就操作
  const addAchievement = (achievement: Achievement) => {
    setUnlockedAchievements(prev => {
      if (prev.some(a => a.id === achievement.id)) return prev;
      return [...prev, achievement];
    });
  };
  const clearAchievements = () => setUnlockedAchievements([]);

  // 提交成绩
  const submitScore = async (scoreData: Omit<Score, 'id' | 'created_at'>) => {
    try {
      await axios.post('/scores', scoreData);
    } catch (error) {
      console.error('提交成绩失败:', error);
      throw error;
    }
  };

  // 获取用户成绩
  const getScores = async (userId: number): Promise<Score[]> => {
    try {
      const response = await axios.get(`/scores/user/${userId}`);
      return response.data.scores;
    } catch (error) {
      console.error('获取成绩失败:', error);
      return [];
    }
  };

  return (
    <GameContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        submitScore,
        getScores,
        comboCount,
        setComboCount,
        resetCombo,
        incrementCombo,
        unlockedAchievements,
        addAchievement,
        clearAchievements,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
