import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, Difficulty, OperationType, Score } from '../types';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 配置axios
axios.defaults.baseURL = API_BASE_URL;

export interface GameContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string) => Promise<User>;
  logout: () => void;
  submitScore: (scoreData: Omit<Score, 'id' | 'created_at'>) => Promise<void>;
  getScores: (userId: number) => Promise<Score[]>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  // 初始化：从localStorage加载用户
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUserState(JSON.parse(savedUser));
    }
  }, []);

  // 保存用户到localStorage
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  // 登录/注册用户
  const login = async (username: string): Promise<User> => {
    try {
      // 首先尝试获取现有用户
      let user = await getUserByUsername(username);

      if (!user) {
        // 如果用户不存在，创建新用户
        // 默认值：年龄8岁，年级2年级（可根据实际情况调整）
        const response = await axios.post('/users', {
          username,
          age: 8,
          grade: 2
        });
        user = response.data.user;
      }

      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('登录失败:', error);
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
        getScores
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
