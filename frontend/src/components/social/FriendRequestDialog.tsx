import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Check as AcceptIcon,
  Close as RejectIcon,
} from '@mui/icons-material';
import { FriendRequest } from '../../types/social';

interface FriendRequestDialogProps {
  open: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onAccept: (requestId: number) => Promise<void>;
  onReject: (requestId: number) => Promise<void>;
}

/**
 * 好友请求弹窗组件
 * 显示待处理的好友请求列表，支持接受/拒绝操作
 */
const FriendRequestDialog: React.FC<FriendRequestDialogProps> = ({
  open,
  onClose,
  requests,
  onAccept,
  onReject,
}) => {
  const [processingId, setProcessingId] = React.useState<number | null>(null);

  const handleAccept = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await onAccept(requestId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await onReject(requestId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        好友请求
        {requests.length > 0 && (
          <Typography
            component="span"
            variant="body2"
            sx={{
              ml: 1,
              bgcolor: 'error.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            {requests.length}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {requests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              暂无好友请求
            </Typography>
          </Box>
        ) : (
          <List>
            {requests.map((request) => (
              <ListItem
                key={request.id}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      color="success"
                      onClick={() => handleAccept(request.id)}
                      disabled={processingId === request.id}
                      sx={{
                        bgcolor: 'success.light',
                        '&:hover': { bgcolor: 'success.main', color: 'white' },
                      }}
                    >
                      {processingId === request.id ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <AcceptIcon />
                      )}
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      sx={{
                        bgcolor: 'error.light',
                        '&:hover': { bgcolor: 'error.main', color: 'white' },
                      }}
                    >
                      {processingId === request.id ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RejectIcon />
                      )}
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48,
                    }}
                  >
                    {request.user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="bold">
                      {request.user.username}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {request.user.totalPoints} 积分 | 连续学习 {request.user.currentStreak} 天
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, px: 3 }}
        >
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FriendRequestDialog;