import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import { useGame } from '../contexts/GameContext';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useGame();

  const [username, setUsername] = useState(currentUser?.username || '');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ p: 4 }}>
        {/* 头部 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              mx: 'auto',
              mb: 2
            }}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {currentUser.username}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            算术小学员
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 用户信息 */}
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              📝 基本信息
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="年龄"
                  value={currentUser.age}
                  type="number"
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="年级"
                  value={currentUser.grade}
                  type="number"
                  variant="outlined"
                  disabled
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* 学习统计 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              📊 学习统计
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <SchoolIcon color="primary" sx={{ mb: 1 }} />
                    <Typography variant="h6">加入天数</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      1
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6">练习次数</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      0
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* 成就徽章 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              🏆 我的成就
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="新手算术家" variant="outlined" />
              <Chip label="待解锁" variant="outlined" color="default" />
              <Chip label="待解锁" variant="outlined" color="default" />
              <Chip label="待解锁" variant="outlined" color="default" />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* 按钮操作 */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              color="error"
            >
              退出登录
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;
