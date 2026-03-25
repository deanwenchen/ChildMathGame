import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CircularProgress,
  List,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LeaderboardItem from '../components/social/LeaderboardItem';
import { LeaderboardEntry, LeaderboardPeriod, MyRankInfo } from '../types/social';
import { useGame } from '../contexts/GameContext';

// 模拟API调用
const fetchLeaderboardApi = async (_period: LeaderboardPeriod): Promise<{
  entries: LeaderboardEntry[];
  myRank: MyRankInfo | null;
}> => {
  // 模拟数据
  const mockUsers = [
    { id: 101, username: '小明', avatar: 'avatar_1', status: 'online' as const, totalPoints: 1280, currentStreak: 15, todayCorrect: 25 },
    { id: 102, username: '小红', avatar: 'avatar_2', status: 'online' as const, totalPoints: 1150, currentStreak: 12, todayCorrect: 22 },
    { id: 103, username: '小刚', avatar: 'avatar_3', status: 'in_game' as const, totalPoints: 980, currentStreak: 10, todayCorrect: 18 },
    { id: 104, username: '小花', avatar: 'avatar_4', status: 'offline' as const, totalPoints: 720, currentStreak: 6, todayCorrect: 12 },
    { id: 105, username: '小华', avatar: 'avatar_5', status: 'online' as const, totalPoints: 650, currentStreak: 5, todayCorrect: 10 },
    { id: 106, username: '小丽', avatar: 'avatar_6', status: 'offline' as const, totalPoints: 580, currentStreak: 4, todayCorrect: 8 },
    { id: 107, username: '小强', avatar: 'avatar_7', status: 'online' as const, totalPoints: 520, currentStreak: 3, todayCorrect: 6 },
    { id: 108, username: '小李', avatar: 'avatar_8', status: 'offline' as const, totalPoints: 480, currentStreak: 2, todayCorrect: 5 },
    { id: 109, username: '小王', avatar: 'avatar_9', status: 'online' as const, totalPoints: 420, currentStreak: 1, todayCorrect: 4 },
    { id: 110, username: '小张', avatar: 'avatar_10', status: 'offline' as const, totalPoints: 380, currentStreak: 1, todayCorrect: 3 },
  ];

  const entries: LeaderboardEntry[] = mockUsers.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    user: user,
    totalPoints: user.totalPoints,
    totalCorrect: Math.floor(user.totalPoints / 10),
    totalTime: user.totalPoints * 5,
  }));

  return {
    entries,
    myRank: {
      rank: 5,
      totalPoints: 520,
      totalCorrect: 52,
      totalTime: 2600,
    },
  };
};

/**
 * 排行榜页面
 */
const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useGame();

  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRankInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载排行榜数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchLeaderboardApi(period);
        setEntries(data.entries);
        setMyRank(data.myRank);
      } catch (error) {
        console.error('加载排行榜失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period]);

  // 切换周期
  const handlePeriodChange = (_: React.MouseEvent<HTMLElement>, newPeriod: LeaderboardPeriod | null) => {
    if (newPeriod) {
      setPeriod(newPeriod);
    }
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* 顶部导航 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/home')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }}>
          排行榜
        </Typography>
        <TrophyIcon color="warning" sx={{ fontSize: 32 }} />
      </Box>

      {/* 周期切换 */}
      <ToggleButtonGroup
        value={period}
        exclusive
        onChange={handlePeriodChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="weekly" sx={{ borderRadius: 2, py: 1.5 }}>
          周榜
        </ToggleButton>
        <ToggleButton value="monthly" sx={{ borderRadius: 2, py: 1.5 }}>
          月榜
        </ToggleButton>
      </ToggleButtonGroup>

      {/* 我的排名卡片 */}
      {myRank && (
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ py: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
              我的排名
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '3px solid white',
                  fontSize: '1.5rem',
                }}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  第 {myRank.rank} 名
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    积分: {myRank.totalPoints}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    正确: {myRank.totalCorrect} 题
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 加载中 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 排行榜列表 */}
      {!loading && (
        <List sx={{ p: 0 }}>
          {entries.map((entry) => (
            <LeaderboardItem
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === currentUser.id}
            />
          ))}
        </List>
      )}

      {/* 提示信息 */}
      {!loading && entries.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            暂无排行数据
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default LeaderboardPage;