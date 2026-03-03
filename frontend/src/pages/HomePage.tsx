import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import CalculateIcon from '@mui/icons-material/Calculate';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useGame } from '../contexts/GameContext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, soundEnabled, setSoundEnabled } = useGame();

  const handlePractice = () => {
    navigate('/practice');
  };

  const handleCuoshiFriendship = () => {
    navigate('/cuoshi-friendship');
  };

  const handleMistakeBook = () => {
    navigate('/mistake-book');
  };

  const handleScores = () => {
    navigate('/scores');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* 标题 */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'primary.main',
            mx: 'auto',
            mb: 2
          }}
        >
          <CalculateIcon sx={{ fontSize: 60 }} />
        </Avatar>
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          算术小能手
        </Typography>
        <Typography variant="h5" color="text.secondary">
          快乐学习，轻松掌握四则运算！
        </Typography>
      </Box>

      {/* 欢迎信息和音效开关 */}
      {currentUser && (
        <Box sx={{ mb: 4, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<SchoolIcon />}
            label={`欢迎回来，${currentUser.username}!`}
            color="primary"
            size="medium"
            sx={{ fontSize: '1.2rem', px: 3, py: 1 }}
          />
          <Chip
            icon={soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            label={soundEnabled ? '音效：开' : '音效：关'}
            onClick={toggleSound}
            color={soundEnabled ? 'success' : 'default'}
            size="medium"
            sx={{
              fontSize: '1rem',
              cursor: 'pointer',
              bgcolor: soundEnabled ? 'success.main' : 'grey.300',
              color: soundEnabled ? 'white' : 'grey.600',
              '&:hover': {
                bgcolor: soundEnabled ? 'success.dark' : 'grey.400',
              }
            }}
          />
        </Box>
      )}

      {/* 功能卡片 */}
      <Grid container spacing={3}>
        {/* 练习卡片 */}
        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor: 'primary.light',
              color: 'white',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalculateIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h3" fontWeight="bold">
                  开始练习
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                选择难度级别，挑战四则运算题目，提升你的算术能力！
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                size="large"
                onClick={handlePractice}
                fullWidth
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                  },
                }}
              >
                🚀 立即开始
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 凑十法闯关卡片 */}
        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor: 'secondary.light',
              color: 'white',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEventsIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h3" fontWeight="bold">
                  凑十法闯关
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                趣味闯关模式，掌握凑十法口诀：看大数，分小数，凑成十，加剩数！
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                size="large"
                onClick={handleCuoshiFriendship}
                fullWidth
                sx={{
                  bgcolor: 'white',
                  color: 'secondary.main',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                  },
                }}
              >
                🎮 开始闯关
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 其他功能卡片 */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AutoFixHighIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                错题本
              </Typography>
              <Typography variant="body2" color="text.secondary">
                定期复习错题，巩固知识点
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                size="large"
                onClick={handleMistakeBook}
                fullWidth
              >
                查看错题
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <EmojiEventsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                我的成绩
              </Typography>
              <Typography variant="body2" color="text.secondary">
                查看历史成绩和进步轨迹
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                size="large"
                onClick={handleScores}
                fullWidth
              >
                查看成绩
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* 底部信息 */}
      <Box sx={{ mt: 6, textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📚 学习功能
        </Typography>
        <Typography variant="body2" color="text.secondary">
          支持加法、减法、乘法、除法四种运算
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          三个难度级别：简单、中等、困难
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          智能计分系统，记录每一次进步
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          🎯 新增：凑十法专项练习，掌握进位加法精髓！
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          📝 错题本系统，基于艾宾浩斯遗忘曲线智能复习！
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
