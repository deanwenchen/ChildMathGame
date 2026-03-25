import db from '../database/database';

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Friendship {
  id?: number;
  requester_id: number;
  addressee_id: number;
  status: FriendshipStatus;
  created_at?: string;
  updated_at?: string;
}

export interface FriendWithDetails {
  id: number;
  username: string;
  avatar: string;
  status: string;
  total_points: number;
  friendship_id: number;
  friends_since: string;
}

export class FriendshipModel {
  /**
   * 发送好友请求
   */
  static async sendRequest(requesterId: number, addresseeId: number): Promise<number> {
    // 检查是否已存在好友关系
    const existing = await this.getFriendship(requesterId, addresseeId);
    if (existing) {
      throw new Error('好友关系已存在');
    }

    // 不能添加自己为好友
    if (requesterId === addresseeId) {
      throw new Error('不能添加自己为好友');
    }

    const sql = `
      INSERT INTO friendships (requester_id, addressee_id, status)
      VALUES (?, ?, 'pending')
    `;
    const lastId = await db.execute(sql, [requesterId, addresseeId]);
    return lastId;
  }

  /**
   * 获取两个用户之间的好友关系
   */
  static async getFriendship(userId1: number, userId2: number): Promise<Friendship | null> {
    const sql = `
      SELECT * FROM friendships
      WHERE (requester_id = ? AND addressee_id = ?)
         OR (requester_id = ? AND addressee_id = ?)
    `;
    const friendship = await db.get(sql, [userId1, userId2, userId2, userId1]);
    return friendship;
  }

  /**
   * 接受好友请求
   */
  static async acceptRequest(requesterId: number, addresseeId: number): Promise<void> {
    const sql = `
      UPDATE friendships
      SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
      WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'
    `;
    await db.execute(sql, [requesterId, addresseeId]);
  }

  /**
   * 拒绝好友请求
   */
  static async rejectRequest(requesterId: number, addresseeId: number): Promise<void> {
    const sql = `
      UPDATE friendships
      SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
      WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'
    `;
    await db.execute(sql, [requesterId, addresseeId]);
  }

  /**
   * 获取用户的好友列表
   */
  static async getFriends(userId: number): Promise<FriendWithDetails[]> {
    const sql = `
      SELECT
        u.id,
        u.username,
        u.avatar,
        u.status,
        u.total_points,
        f.id as friendship_id,
        f.updated_at as friends_since
      FROM friendships f
      JOIN users u ON (
        (f.requester_id = ? AND u.id = f.addressee_id)
        OR (f.addressee_id = ? AND u.id = f.requester_id)
      )
      WHERE f.status = 'accepted'
      ORDER BY u.username
    `;
    const friends = await db.query(sql, [userId, userId]);
    return friends;
  }

  /**
   * 获取待处理的好友请求
   */
  static async getPendingRequests(userId: number): Promise<any[]> {
    const sql = `
      SELECT
        f.id as friendship_id,
        f.created_at,
        u.id,
        u.username,
        u.avatar
      FROM friendships f
      JOIN users u ON f.requester_id = u.id
      WHERE f.addressee_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;
    const requests = await db.query(sql, [userId]);
    return requests;
  }

  /**
   * 获取已发送的好友请求
   */
  static async getSentRequests(userId: number): Promise<any[]> {
    const sql = `
      SELECT
        f.id as friendship_id,
        f.created_at,
        f.status,
        u.id,
        u.username,
        u.avatar
      FROM friendships f
      JOIN users u ON f.addressee_id = u.id
      WHERE f.requester_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;
    const requests = await db.query(sql, [userId]);
    return requests;
  }

  /**
   * 获取在线好友
   */
  static async getOnlineFriends(userId: number): Promise<FriendWithDetails[]> {
    const sql = `
      SELECT
        u.id,
        u.username,
        u.avatar,
        u.status,
        u.total_points,
        f.id as friendship_id,
        f.updated_at as friends_since
      FROM friendships f
      JOIN users u ON (
        (f.requester_id = ? AND u.id = f.addressee_id)
        OR (f.addressee_id = ? AND u.id = f.requester_id)
      )
      WHERE f.status = 'accepted' AND u.status = 'online'
      ORDER BY u.username
    `;
    const friends = await db.query(sql, [userId, userId]);
    return friends;
  }

  /**
   * 删除好友
   */
  static async removeFriend(userId: number, friendId: number): Promise<void> {
    const sql = `
      DELETE FROM friendships
      WHERE ((requester_id = ? AND addressee_id = ?)
         OR (requester_id = ? AND addressee_id = ?))
        AND status = 'accepted'
    `;
    await db.execute(sql, [userId, friendId, friendId, userId]);
  }

  /**
   * 检查是否为好友
   */
  static async areFriends(userId1: number, userId2: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count FROM friendships
      WHERE ((requester_id = ? AND addressee_id = ?)
         OR (requester_id = ? AND addressee_id = ?))
        AND status = 'accepted'
    `;
    const result = await db.get(sql, [userId1, userId2, userId2, userId1]);
    return result.count > 0;
  }

  /**
   * 获取好友数量
   */
  static async getFriendCount(userId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count FROM friendships
      WHERE (requester_id = ? OR addressee_id = ?)
        AND status = 'accepted'
    `;
    const result = await db.get(sql, [userId, userId]);
    return result.count;
  }
}

export default FriendshipModel;