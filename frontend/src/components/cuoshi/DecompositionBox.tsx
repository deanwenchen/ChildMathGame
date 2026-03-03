import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { CuoshiQuestion } from '../../utils/cuoshi';

interface DecompositionBoxProps {
  question: CuoshiQuestion;
  showAnswer?: boolean;
  highlightStep?: number; // 高亮第几步 (0-3)
}

/**
 * 凑十法分解框组件
 *
 * 可视化展示凑十法的四步骤：
 * 1. 看大数
 * 2. 分小数
 * 3. 凑成十
 * 4. 加剩数
 *
 * 参考 pedagogy.md 中的表格设计
 */
const DecompositionBox: React.FC<DecompositionBoxProps> = ({
  question,
  showAnswer = false,
  highlightStep = -1,
}) => {
  const { bigNumber, smallNumber, decomposition, answer } = question;

  // 高亮样式
  const getHighlightStyle = (stepIndex: number) => ({
    backgroundColor: highlightStep === stepIndex ? '#FFF3E0' : 'transparent',
    transition: 'background-color 0.3s ease',
  });

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '3px solid',
        borderColor: 'primary.main',
      }}
    >
      {/* 主算式 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '2px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem' },
            color: 'primary.main',
          }}
        >
          {bigNumber} + {smallNumber} ={' '}
          <Box component="span" color={showAnswer ? 'success.main' : 'text.disabled'}>
            {showAnswer ? answer : '?'}
          </Box>
        </Typography>
      </Box>

      {/* 分解过程 */}
      <Box sx={{ position: 'relative' }}>
        {/* 第一行：大数 + 小数分解 */}
        <Box
          sx={{
            ...getHighlightStyle(0),
            borderRadius: 2,
            p: 1,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: { xs: 1, sm: 2 },
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {/* 大数 */}
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {bigNumber}
            </Box>

            <Typography sx={{ pt: 1 }}>+</Typography>

            {/* 小数分解 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 100,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: 'secondary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  mb: 1,
                }}
              >
                {smallNumber}
              </Box>
              {/* 分解箭头 */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  position: 'relative',
                  top: -5,
                }}
              >
                <Box
                  sx={{
                    width: 45,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#FF9800',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    border: '2px solid',
                    borderColor: '#FF5722',
                  }}
                >
                  {decomposition.partForTen}
                </Box>
                <Box
                  sx={{
                    width: 45,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#4CAF50',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    border: '2px solid',
                    borderColor: '#388E3C',
                  }}
                >
                  {decomposition.remaining}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 箭头指向 10 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: '2rem',
              color: 'text.secondary',
              animation: 'bounce 1s infinite',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(5px)' },
              },
            }}
          >
            ↓
          </Typography>
        </Box>

        {/* 第二行：凑成十 + 加剩数 */}
        <Box
          sx={{
            ...getHighlightStyle(1),
            borderRadius: 2,
            p: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              fontSize: { xs: '1.5rem', sm: '2rem' },
              flexWrap: 'wrap',
            }}
          >
            {/* 10 的方框 */}
            <Box
              sx={{
                minWidth: 80,
                height: 60,
                borderRadius: 2,
                bgcolor: '#1976D2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.8rem',
              }}
            >
              10
            </Box>

            <Typography sx={{ pt: 1 }}>+</Typography>

            {/* 剩余部分 */}
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: '#4CAF50',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              {decomposition.remaining}
            </Box>

            <Typography>=</Typography>

            {/* 最终答案 */}
            <Box
              sx={{
                minWidth: 80,
                height: 60,
                borderRadius: 2,
                bgcolor: showAnswer ? 'success.main' : 'grey.300',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease',
              }}
            >
              {showAnswer ? answer : '?'}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 步骤提示文字 */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: '2px dashed',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 1,
            fontSize: { xs: '0.85rem', sm: '1rem' },
          }}
        >
          <Typography
            color={highlightStep >= 0 ? 'primary.main' : 'text.secondary'}
            fontWeight={highlightStep === 0 ? 'bold' : 'normal'}
          >
            👀 看大数
          </Typography>
          <Typography color="text.secondary">→</Typography>
          <Typography
            color={highlightStep >= 1 ? 'primary.main' : 'text.secondary'}
            fontWeight={highlightStep === 1 ? 'bold' : 'normal'}
          >
            ✂️ 分小数
          </Typography>
          <Typography color="text.secondary">→</Typography>
          <Typography
            color={highlightStep >= 2 ? 'primary.main' : 'text.secondary'}
            fontWeight={highlightStep === 2 ? 'bold' : 'normal'}
          >
            🎯 凑成十
          </Typography>
          <Typography color="text.secondary">→</Typography>
          <Typography
            color={highlightStep >= 3 ? 'primary.main' : 'text.secondary'}
            fontWeight={highlightStep === 3 ? 'bold' : 'normal'}
          >
            ➕ 加剩数
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default DecompositionBox;
