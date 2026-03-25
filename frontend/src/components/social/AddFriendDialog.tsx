import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PersonAdd as AddIcon } from '@mui/icons-material';
import { SocialUser } from '../../types/social';

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
  onSendRequest: (userId: number) => Promise<void>;
}

// 模拟搜索用户API（实际项目中应调用后端）
const searchUsers = async (query: string): Promise<SocialUser[]> => {
  // TODO: 替换为实际API调用
  // const response = await axios.get(`/api/friends/search?username=${query}`);
  // return response.data.users;

  // 模拟数据
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query) {
        resolve([]);
        return;
      }
      // 模拟搜索结果
      const mockUsers: SocialUser[] = [
        { id: 101, username: '小明', avatar: 'avatar_1', status: 'online' as const, totalPoints: 520, currentStreak: 5, todayCorrect: 12 },
        { id: 102, username: '小红', avatar: 'avatar_2', status: 'offline' as const, totalPoints: 380, currentStreak: 3, todayCorrect: 8 },
        { id: 103, username: '小刚', avatar: 'avatar_3', status: 'online' as const, totalPoints: 650, currentStreak: 7, todayCorrect: 15 },
      ].filter(u => u.username.includes(query));
      resolve(mockUsers);
    }, 300);
  });
};

/**
 * 添加好友对话框
 */
const AddFriendDialog: React.FC<AddFriendDialogProps> = ({
  open,
  onClose,
  onSendRequest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SocialUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 防抖搜索
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery.trim());
        setSearchResults(results);
      } catch (err) {
        setError('搜索失败，请重试');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 发送好友请求
  const handleSendRequest = async (userId: number) => {
    setSendingTo(userId);
    setError(null);
    setSuccess(null);

    try {
      await onSendRequest(userId);
      setSuccess('好友请求已发送!');
      // 从搜索结果中移除已发送的用户
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message || '发送失败，请重试');
    } finally {
      setSendingTo(null);
    }
  };

  // 关闭时重置状态
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        添加好友
      </DialogTitle>

      <DialogContent>
        {/* 搜索输入框 */}
        <TextField
          autoFocus
          fullWidth
          placeholder="输入用户名搜索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />

        {/* 提示信息 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* 搜索中状态 */}
        {isSearching && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 搜索结果列表 */}
        {!isSearching && searchResults.length > 0 && (
          <List>
            {searchResults.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    disabled={sendingTo === user.id}
                    onClick={() => handleSendRequest(user.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    {sendingTo === user.id ? '发送中...' : '添加'}
                  </Button>
                }
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  mb: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.username}
                  secondary={`${user.totalPoints} 积分 · 连续学习 ${user.currentStreak} 天`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* 无结果提示 */}
        {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              未找到用户 "{searchQuery}"
            </Typography>
          </Box>
        )}

        {/* 初始提示 */}
        {!searchQuery.trim() && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              输入用户名搜索你想添加的好友
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          sx={{ borderRadius: 2, px: 3 }}
        >
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFriendDialog;