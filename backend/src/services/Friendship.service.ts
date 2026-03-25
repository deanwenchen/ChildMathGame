import FriendshipModel, { FriendshipStatus, FriendWithDetails } from '../models/Friendship.model';
import CheerModel, { CheerMessageType, CheerWithSender } from '../models/Cheer.model';
import UserModel, { User, UserStatus } from '../models/User.model';

export interface SearchResult {
  id: number;
  username: string;
  avatar: string;
  total_points: number;
  friendship_status?: 'none' | 'pending_sent' | 'pending_received' | 'friends';
}

export class FriendshipService {
  /**
   * 搜索用户（用于添加好友）
   */
  static async searchUsers(
    currentUserId: number,
    query: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    // 验证搜索词
    if (!query || query.length < 1) {
      return [];
    }

    // 搜索用户名
    const users = await this.searchByUsername(query, currentUserId, limit);

    // 获取好友关系状态
    const results: SearchResult[] = [];
    for (const user of users) {
      const friendship = await FriendshipModel.getFriendship(currentUserId, user.id);

      let friendship_status: 'none' | 'pending_sent' | 'pending_received' | 'friends' = 'none';
      if (friendship) {
        if (friendship.status === 'accepted') {
          friendship_status = 'friends';
        } else if (friendship.status === 'pending') {
          friendship_status = friendship.requester_id === currentUserId
            ? 'pending_sent'
            : 'pending_received';
        }
      }

      results.push({
        id: user.id,
        username: user.username,
        avatar: user.avatar || 'default',
        total_points: user.total_points || 0,
        friendship_status
      });
    }

    return results;
  }

  private static async searchByUsername(
    query: string,
    excludeUserId: number,
    limit: number
  ): Promise<any[]> {
    const db = (await import('../database/database')).default;
    const sql = `
      SELECT id, username, avatar, total_points
      FROM users
      WHERE username LIKE ? AND id != ?
      ORDER BY total_points DESC
      LIMIT ?
    `;
    return db.query(sql, [`%${query}%`, excludeUserId, limit]);
  }

  /**
   * 发送好友请求
   */
  static async sendFriendRequest(
    requesterId: number,
    addresseeId: number
  ): Promise<{ success: boolean; message: string }> {
    // 检查家长授权
    const requester = await UserModel.findById(requesterId);
    if (!requester) {
      return { success: false, message: '用户不存在' };
    }

    if (!requester.parent_approval) {
      return { success: false, message: '需要家长授权才能添加好友' };
    }

    // 检查目标用户是否存在且有家长授权
    const addressee = await UserModel.findById(addresseeId);
    if (!addressee) {
      return { success: false, message: '目标用户不存在' };
    }

    if (!addressee.parent_approval) {
      return { success: false, message: '该用户未开启好友功能' };
    }

    // 检查好友数量限制
    const friendCount = await FriendshipModel.getFriendCount(requesterId);
    if (friendCount >= 20) {
      return { success: false, message: '好友数量已达上限（20人）' };
    }

    try {
      await FriendshipModel.sendRequest(requesterId, addresseeId);
      return { success: true, message: '好友请求已发送' };
    } catch (error: any) {
      return { success: false, message: error.message || '发送失败' };
    }
  }

  /**
   * 接受好友请求
   */
  static async acceptFriendRequest(
    userId: number,
    requesterId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      await FriendshipModel.acceptRequest(requesterId, userId);
      return { success: true, message: '已添加为好友' };
    } catch (error: any) {
      return { success: false, message: error.message || '操作失败' };
    }
  }

  /**
   * 拒绝好友请求
   */
  static async rejectFriendRequest(
    userId: number,
    requesterId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      await FriendshipModel.rejectRequest(requesterId, userId);
      return { success: true, message: '已拒绝好友请求' };
    } catch (error: any) {
      return { success: false, message: error.message || '操作失败' };
    }
  }

  /**
   * 获取好友列表
   */
  static async getFriends(userId: number): Promise<FriendWithDetails[]> {
    return FriendshipModel.getFriends(userId);
  }

  /**
   * 获取在线好友
   */
  static async getOnlineFriends(userId: number): Promise<FriendWithDetails[]> {
    return FriendshipModel.getOnlineFriends(userId);
  }

  /**
   * 获取待处理的好友请求
   */
  static async getPendingRequests(userId: number): Promise<any[]> {
    return FriendshipModel.getPendingRequests(userId);
  }

  /**
   * 获取已发送的好友请求
   */
  static async getSentRequests(userId: number): Promise<any[]> {
    return FriendshipModel.getSentRequests(userId);
  }

  /**
   * 删除好友
   */
  static async removeFriend(
    userId: number,
    friendId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      await FriendshipModel.removeFriend(userId, friendId);
      return { success: true, message: '已删除好友' };
    } catch (error: any) {
      return { success: false, message: error.message || '操作失败' };
    }
  }

  /**
   * 发送加油消息
   */
  static async sendCheer(
    senderId: number,
    receiverId: number,
    messageType: CheerMessageType
  ): Promise<{ success: boolean; message: string }> {
    // 检查是否为好友
    const areFriends = await FriendshipModel.areFriends(senderId, receiverId);
    if (!areFriends) {
      return { success: false, message: '只能给好友发送加油' };
    }

    // 检查发送频率
    const canSend = await CheerModel.canSendCheer(senderId, receiverId);
    if (!canSend.canSend) {
      return { success: false, message: canSend.reason || '发送太频繁' };
    }

    try {
      await CheerModel.sendCheer(senderId, receiverId, messageType);
      return { success: true, message: '加油消息已发送' };
    } catch (error: any) {
      return { success: false, message: error.message || '发送失败' };
    }
  }

  /**
   * 获取收到的加油消息
   */
  static async getReceivedCheers(userId: number, limit: number = 20): Promise<CheerWithSender[]> {
    return CheerModel.getReceivedCheers(userId, limit);
  }

  /**
   * 获取未读加油消息数量
   */
  static async getUnreadCheersCount(userId: number): Promise<number> {
    return CheerModel.getUnreadCount(userId);
  }

  /**
   * 标记加油消息为已读
   */
  static async markCheerAsRead(cheerId: number, userId: number): Promise<void> {
    return CheerModel.markAsRead(cheerId, userId);
  }

  /**
   * 标记所有加油消息为已读
   */
  static async markAllCheersAsRead(userId: number): Promise<void> {
    return CheerModel.markAllAsRead(userId);
  }

  /**
   * 获取可用的加油消息类型
   */
  static getCheerMessageTypes(): { type: string; message: string }[] {
    return CheerModel.getAvailableMessageTypes();
  }

  /**
   * 更新用户在线状态
   */
  static async updateUserStatus(userId: number, status: UserStatus): Promise<void> {
    return UserModel.updateStatus(userId, status);
  }
}

export default FriendshipService;