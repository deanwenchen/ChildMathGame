import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Alert,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useGame } from '../contexts/GameContext';

const WelcomePage: React.FC = () => {
  const { login } = useGame();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (username.trim() === '') {
      setError('请输入用户名');
      return;
    }

    if (username.length < 2 || username.length > 20) {
      setError('用户名长度应在2-20个字符之间');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username.trim());
      // login 成功后会自动跳转到主页
    } catch (err) {
      setError('登录失败，请重试');
      setLoading(false);
    }
  };

  // 回车键触发
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && username.trim() !== '') {
      handleStart();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'primary.main',
              mx: 'auto',
              mb: 3
            }}
          >
            <CalculateIcon sx={{ fontSize: 80 }} />
          </Avatar>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            算术小能手
          </Typography>
          <Typography variant="h6" color="text.secondary">
            快乐学习，轻松掌握四则运算！
          </Typography>
        </Box>

        {/* 用户名输入 */}
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              请输入你的名字开始学习：
            </Typography>
            <TextField
              fullWidth
              size="large"
              placeholder="你的名字"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.2rem'
                }
              }}
            />
          </Box>

          {/* 错误提示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* 开始按钮 */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleStart}
            disabled={loading || username.trim() === ''}
            sx={{
              py: 2,
              fontSize: '1.2rem',
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            {loading ? '加载中...' : '🚀 开始学习'}
          </Button>

          {/* 提示信息 */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ✨ 每次练习10道题目
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              🎯 支持加减乘除四则运算
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              📊 自动记录成绩和进步
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default WelcomePage;
