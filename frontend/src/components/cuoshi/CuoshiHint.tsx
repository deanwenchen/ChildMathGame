import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { CuoshiQuestion, getDecompositionSteps } from '../../utils/cuoshi';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';

interface CuoshiHintProps {
  question: CuoshiQuestion;
  remainingHints: number;
  onUseHint: () => void;
}

/**
 * 凑十法提示组件
 *
 * 功能：
 * - 显示剩余提示次数
 * - 点击显示分解步骤提示
 * - 每关限制使用次数
 */
const CuoshiHint: React.FC<CuoshiHintProps> = ({
  question,
  remainingHints,
  onUseHint,
}) => {
  const [showHint, setShowHint] = useState(false);

  const handleOpenHint = () => {
    if (remainingHints > 0) {
      onUseHint();
      setShowHint(true);
    }
  };

  const steps = getDecompositionSteps(question);

  return (
    <>
      {/* 提示按钮 */}
      <Button
        variant="outlined"
        startIcon={<HelpOutlineIcon />}
        onClick={handleOpenHint}
        disabled={remainingHints <= 0}
        sx={{
          borderRadius: 3,
          px: 3,
          py: 1,
          borderWidth: remainingHints > 0 ? 2 : 1,
        }}
      >
        💡 提示 ({remainingHints})
      </Button>

      {/* 提示弹窗 */}
      <Dialog
        open={showHint}
        onClose={() => setShowHint(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', pt: 2 }}>
          {/* 关闭按钮 */}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setShowHint(false)}
          >
            <CloseIcon />
          </IconButton>

          {/* 标题 */}
          <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
            📖 凑十法口诀
          </Typography>

          {/* 分解步骤 */}
          <Box sx={{ mt: 2 }}>
            {steps.map((step, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor:
                    index === 0
                      ? '#E3F2FD'
                      : index === 1
                      ? '#FFF3E0'
                      : index === 2
                      ? '#F3E5F5'
                      : '#E8F5E9',
                  borderLeft: '4px solid',
                  borderLeftColor:
                    index === 0
                      ? '#1976D2'
                      : index === 1
                      ? '#FF9800'
                      : index === 2
                      ? '#9C27B0'
                      : '#4CAF50',
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  {step}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* 提示语 */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              💡 记住口诀：**看大数，分小数，凑成十，加剩数**
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CuoshiHint;
