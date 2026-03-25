import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
  Avatar,
  Badge,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  PersonAdd as AddFriendIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FriendCard from '../components/social/FriendCard';
import AddFriendDialog from '../components/social/AddFriendDialog';
import { Friend, FriendRequest, CheerType, CHEER_PRESETS } from '../types/social';
import { useGame } from '../contexts/GameContext';

// 模拟API调用（实际项目中应替换为真实API）
const fetchFriendsApi = async (): Promise<Friend[]> => {
  // 模拟数据
  return [
    { id: 101, username: '小红', avatar: 'avatar_1', status: 'online', totalPoints: 520, currentStreak: 5, todayCorrect: 12, friendshipId: 1, friendSince: '2024-01-15' },
    { id: 102, username: '小明', avatar: 'avatar_2', status: 'online', totalPoints: 380, currentStreak: 3, todayCorrect: 8, friendshipId: 2, friendSince: '2024-01-18' },
    { id: 103, username: '小刚', avatar: 'avatar_3', status: 'in_game', totalPoints: 650, currentStreak: 7, todayCorrect: 15, friendshipId: 3, friendSince: '2024-01-20' },
    { id: 104, username: '小花', avatar: 'avatar_4', status: 'offline', totalPoints: 280, currentStreak: 2, todayCorrect: 0, friendshipId: 4, friendSince: '2024-02-01', lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 105, username: '小华', avatar: 'avatar_5', status: 'offline', totalPoints: 450, currentStreak: 4, todayCorrect: 6, friendshipId: 5, friendSince: '2024-02-05', lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  ];
};

const fetchFriendRequestsApi = async (): Promise<FriendRequest[]> => {
  // 模拟数据
  return [
    { id: 1, user: { id: 201, username: '小丽', avatar: 'avatar_6', status: 'offline', totalPoints: 320, currentStreak: 4, todayCorrect: 10 }, status: 'pending', createdAt: new Date().toISOString() },
    { id: 2, user: { id: 202, username: '小强', avatar: 'avatar_7', status: 'online', totalPoints: 480, currentStreak: 6, todayCorrect: 14 }, status: 'pending', createdAt: new Date().toISOString() },
  ];
};

/**
 * 好友页面
 */
const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useGame();

  const [tabValue, setTabValue] = useState(0);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [cheerDialogOpen, setCheerDialogOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);

  // 加载好友列表
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [friendsData, requestsData] = await Promise.all([
          fetchFriendsApi(),
          fetchFriendRequestsApi(),
        ]);
        setFriends(friendsData);
        setFriendRequests(requestsData);
      } catch (error) {
        console.error('加载好友数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 过滤好友列表
  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 在线好友
  const onlineFriends = filteredFriends.filter(f => f.status === 'online' || f.status === 'in_game');

  // 全部好友
  const allFriends = filteredFriends;

  // 发送加油
  const handleSendCheer = (friendId: number) => {
    setSelectedFriendId(friendId);
    setCheerDialogOpen(true);
  };

  // 确认发送加油
  const handleConfirmCheer = async (type: CheerType, message: string) => {
    // TODO: 调用API发送加油
    console.log('发送加油:', { friendId: selectedFriendId, type, message });
    setCheerDialogOpen(false);
    setSelectedFriendId(null);
  };

  // 邀请PK
  const handleInvitePK = (friendId: number) => {
    // TODO: 实现PK邀请逻辑
    console.log('邀请PK:', friendId);
    navigate('/pk-match', { state: { inviteFriendId: friendId } });
  };

  // 接受好友请求
  const handleAcceptRequest = async (requestId: number) => {
    // TODO: 调用API接受请求
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // 拒绝好友请求
  const handleRejectRequest = async (requestId: number) => {
    // TODO: 调用API拒绝请求
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // 发送好友请求
  const handleSendFriendRequest = async (userId: number) => {
    // TODO: 调用API发送请求
    console.log('发送好友请求:', userId);
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
          我的好友
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddFriendIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          添加
        </Button>
      </Box>

      {/* 搜索框 */}
      <TextField
        fullWidth
        placeholder="搜索好友..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          sx: { borderRadius: 3, mb: 2 },
        }}
      />

      {/* 标签页 */}
      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        sx={{ mb: 2 }}
      >
        <Tab
          label={
            <Badge badgeContent={onlineFriends.length} color="success" max={99}>
              在线好友
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={friendRequests.length} color="error" max={99}>
              好友请求
            </Badge>
          }
        />
        <Tab label={`全部好友 (${allFriends.length})`} />
      </Tabs>

      {/* 加载中 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 内容区域 */}
      {!loading && (
        <>
          {/* 在线好友 */}
          {tabValue === 0 && (
            <>
              {onlineFriends.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography color="text.secondary">
                    暂无在线好友
                  </Typography>
                </Box>
              ) : (
                onlineFriends.map(friend => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onSendCheer={handleSendCheer}
                    onInvitePK={handleInvitePK}
                  />
                ))
              )}
            </>
          )}

          {/* 好友请求 */}
          {tabValue === 1 && (
            <>
              {friendRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography color="text.secondary">
                    暂无好友请求
                  </Typography>
                </Box>
              ) : (
                friendRequests.map(request => (
                  <Box
                    key={request.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      mb: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}>
                      {request.user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {request.user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        想和你成为好友
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <CloseIcon />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Box>
                ))
              )}
            </>
          )}

          {/* 全部好友 */}
          {tabValue === 2 && (
            <>
              {allFriends.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography color="text.secondary">
                    {searchQuery ? '未找到匹配的好友' : '还没有好友，快去添加吧!'}
                  </Typography>
                </Box>
              ) : (
                allFriends.map(friend => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onSendCheer={handleSendCheer}
                    onInvitePK={handleInvitePK}
                  />
                ))
              )}
            </>
          )}
        </>
      )}

      {/* 添加好友对话框 */}
      <AddFriendDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSendRequest={handleSendFriendRequest}
      />

      {/* 加油消息选择对话框 */}
      <Dialog
        open={cheerDialogOpen}
        onClose={() => setCheerDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          选择加油消息
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {CHEER_PRESETS.map((preset) => (
              <Chip
                key={`${preset.type}-${preset.message}`}
                label={`${preset.emoji} ${preset.message}`}
                onClick={() => handleConfirmCheer(preset.type, preset.message)}
                sx={{
                  fontSize: '1rem',
                  py: 2.5,
                  px: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.light' },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => setCheerDialogOpen(false)} sx={{ borderRadius: 2 }}>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FriendsPage;