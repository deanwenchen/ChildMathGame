import express, { Request, Response, NextFunction } from 'express';
import FriendshipService from '../services/Friendship.service';
import UserModel from '../models/User.model';

const router = express.Router();

// 扩展 Request 类型以包含 userId
interface AuthRequest extends Request {
  userId?: number;
}

/**
 * 家长授权检查中间件
 * 确保用户有家长授权才能使用社交功能
 */
const requireParentApproval = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] as string || req.body.userId || '0');

    if (!userId) {
      return res.status(401).json({ error: '请先登录' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (!user.parent_approval) {
      return res.status(403).json({
        error: '需要家长授权',
        message: '请让家长在设置中开启好友功能'
      });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('家长授权检查失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * 可选的用户ID中间件
 * 用于获取用户ID但不强制要求
 */
const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] as string || req.query.userId as string || '0');
    req.userId = userId || undefined;
    next();
  } catch (error) {
    next();
  }
};

// ==================== 用户搜索 ====================

/**
 * GET /api/friends/search
 * 搜索用户（用于添加好友）
 * Query: q (搜索关键词), limit (结果数量)
 */
router.get('/search', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const currentUserId = req.userId || 0;

    if (!query || query.length < 1) {
      return res.status(400).json({ error: '请输入搜索关键词' });
    }

    const results = await FriendshipService.searchUsers(currentUserId, query, limit);
    res.json({ results });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// ==================== 好友请求 ====================

/**
 * POST /api/friends/request
 * 发送好友请求
 * Body: { addresseeId: number }
 */
router.post('/request', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const { addresseeId } = req.body;
    const requesterId = req.userId!;

    if (!addresseeId) {
      return res.status(400).json({ error: '缺少目标用户ID' });
    }

    const result = await FriendshipService.sendFriendRequest(requesterId, addresseeId);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('发送好友请求失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/friends/accept
 * 接受好友请求
 * Body: { requesterId: number }
 */
router.post('/accept', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const { requesterId } = req.body;
    const userId = req.userId!;

    if (!requesterId) {
      return res.status(400).json({ error: '缺少请求者ID' });
    }

    const result = await FriendshipService.acceptFriendRequest(userId, requesterId);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('接受好友请求失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/friends/reject
 * 拒绝好友请求
 * Body: { requesterId: number }
 */
router.post('/reject', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const { requesterId } = req.body;
    const userId = req.userId!;

    if (!requesterId) {
      return res.status(400).json({ error: '缺少请求者ID' });
    }

    const result = await FriendshipService.rejectFriendRequest(userId, requesterId);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('拒绝好友请求失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// ==================== 好友列表 ====================

/**
 * GET /api/friends
 * 获取好友列表
 */
router.get('/', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const friends = await FriendshipService.getFriends(userId);
    res.json({ friends });
  } catch (error) {
    console.error('获取好友列表失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/friends/online
 * 获取在线好友列表
 */
router.get('/online', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const friends = await FriendshipService.getOnlineFriends(userId);
    res.json({ friends });
  } catch (error) {
    console.error('获取在线好友失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/friends/requests/pending
 * 获取待处理的好友请求
 */
router.get('/requests/pending', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const requests = await FriendshipService.getPendingRequests(userId);
    res.json({ requests });
  } catch (error) {
    console.error('获取待处理请求失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/friends/requests/sent
 * 获取已发送的好友请求
 */
router.get('/requests/sent', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const requests = await FriendshipService.getSentRequests(userId);
    res.json({ requests });
  } catch (error) {
    console.error('获取已发送请求失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/friends/:friendId
 * 删除好友
 */
router.delete('/:friendId', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const friendId = parseInt(req.params.friendId);

    if (!friendId) {
      return res.status(400).json({ error: '无效的好友ID' });
    }

    const result = await FriendshipService.removeFriend(userId, friendId);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('删除好友失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// ==================== 加油功能 ====================

/**
 * GET /api/friends/cheers/messages
 * 获取可用的加油消息类型
 */
router.get('/cheers/messages', (req: Request, res: Response) => {
  const messages = FriendshipService.getCheerMessageTypes();
  res.json({ messages });
});

/**
 * POST /api/friends/cheers
 * 发送加油消息
 * Body: { receiverId: number, messageType: string }
 */
router.post('/cheers', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, messageType } = req.body;
    const senderId = req.userId!;

    if (!receiverId || !messageType) {
      return res.status(400).json({ error: '缺少必填参数' });
    }

    const result = await FriendshipService.sendCheer(senderId, receiverId, messageType);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('发送加油失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/friends/cheers/received
 * 获取收到的加油消息
 */
router.get('/cheers/received', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;
    const cheers = await FriendshipService.getReceivedCheers(userId, limit);
    res.json({ cheers });
  } catch (error) {
    console.error('获取加油消息失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/friends/cheers/unread
 * 获取未读加油消息数量
 */
router.get('/cheers/unread', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const count = await FriendshipService.getUnreadCheersCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('获取未读数量失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/friends/cheers/:cheerId/read
 * 标记加油消息为已读
 */
router.post('/cheers/:cheerId/read', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const cheerId = parseInt(req.params.cheerId);

    if (!cheerId) {
      return res.status(400).json({ error: '无效的消息ID' });
    }

    await FriendshipService.markCheerAsRead(cheerId, userId);
    res.json({ message: '已标记为已读' });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/friends/cheers/read-all
 * 标记所有加油消息为已读
 */
router.post('/cheers/read-all', requireParentApproval, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await FriendshipService.markAllCheersAsRead(userId);
    res.json({ message: '已全部标记为已读' });
  } catch (error) {
    console.error('标记全部已读失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// ==================== 用户状态 ====================

/**
 * PUT /api/friends/status
 * 更新用户在线状态
 * Body: { status: 'online' | 'offline' | 'busy' }
 */
router.put('/status', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.headers['x-user-id'] as string || req.body.userId || '0');
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: '请先登录' });
    }

    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }

    await FriendshipService.updateUserStatus(userId, status);
    res.json({ message: '状态已更新' });
  } catch (error) {
    console.error('更新状态失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;