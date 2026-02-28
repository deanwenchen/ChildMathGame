import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGame } from '../contexts/GameContext';
import { Difficulty, OperationType } from '../types';

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useGame();

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [operation, setOperation] = useState<OperationType>('addition');
  const [error, setError] = useState<string>('');

  // 难度选项
  const difficultyOptions = [
    { value: 'easy' as Difficulty, label: '简单', desc: '1-20以内的运算，适合初学者' },
    { value: 'medium' as Difficulty, label: '中等', desc: '10-50以内的运算，适合进阶' },
    { value: 'hard' as Difficulty, label: '困难', desc: '50-200以内的运算，挑战高手' },
  ];

  // 运算类型选项
  const operationOptions = [
    { value: 'addition' as OperationType, label: '加法 (+)', icon: '➕' },
    { value: 'subtraction' as OperationType, label: '减法 (-)', icon: '➖' },
    { value: 'multiplication' as OperationType, label: '乘法 (×)', icon: '✖️' },
    { value: 'division' as OperationType, label: '除法 (÷)', icon: '➗' },
  ];

  const handleStartPractice = async () => {
    if (!currentUser) {
      // 如果没有登录，跳转到首页让用户登录
      setError('请先在首页输入用户名开始练习');
      return;
    }

    // 保存选择到sessionStorage
    sessionStorage.setItem('practiceConfig', JSON.stringify({
      difficulty,
      operation
    }));

    navigate('/practice-game');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            返回首页
          </Button>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            📝 选择练习模式
          </Typography>
          <Typography variant="body1" color="text.secondary">
            选择难度级别和运算类型，开始你的算术挑战！
          </Typography>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* 难度选择 */}
        <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              🎯 难度级别
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <Grid container spacing={2}>
                  {difficultyOptions.map((option) => (
                    <Grid item xs={12} key={option.value}>
                      <FormControlLabel
                        value={option.value}
                        control={
                          <Radio
                            sx={{
                              '&.Mui-checked': {
                                color: 'primary.main',
                              },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {option.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.desc}
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* 运算类型选择 */}
        <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              🔢 运算类型
            </Typography>
            <RadioGroup
              value={operation}
              onChange={(e) => setOperation(e.target.value as OperationType)}
            >
              <Grid container spacing={2}>
                {operationOptions.map((option) => (
                  <Grid item xs={12} sm={6} key={option.value}>
                    <FormControlLabel
                      value={option.value}
                      control={
                        <Radio
                          sx={{
                            '&.Mui-checked': {
                              color: 'secondary.main',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h4" sx={{ mr: 2 }}>
                            {option.icon}
                          </Typography>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {option.label}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 开始按钮 */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartPractice}
            sx={{
              px: 8,
              py: 2,
              fontSize: '1.2rem',
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            🎮 开始练习
          </Button>

          {/* 当前选择预览 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              你的选择：
            </Typography>
            <Chip
              label={`难度: ${difficultyOptions.find(o => o.value === difficulty)?.label}`}
              color="primary"
              sx={{ mr: 1 }}
            />
            <Chip
              label={`运算: ${operationOptions.find(o => o.value === operation)?.label}`}
              color="secondary"
            />
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default PracticePage;
