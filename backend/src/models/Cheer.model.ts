import db from '../database/database';

// 预设的加油消息（儿童友好，经过审核）
export const PRESET_CHEER_MESSAGES: Record<string, string> = {
  'great_job': '太棒了！继续加油！',
  'keep_going': '你是最棒的！',
  'awesome': '做得好！为你骄傲！',
  'star': '你是小明星！',
  'super': '超级厉害！',
  'believe': '相信自己！',
  'progress': '每天都在进步！',
  'try_again': '再接再厉！'
};

export type CheerMessageType = keyof typeof PRESET_CHEER_MESSAGES;

export interface Cheer {
  id?: number;
  sender_id: number;
  receiver_id: number;
  message_type: CheerMessageType;
  is_read: boolean;
  created_at?: string;
}

export interface CheerWithSender extends Cheer {
  sender_username: string;
  sender_avatar: string;
  message: string;
}

export class CheerModel {
  /**
   * 发送加油消息
   */
  static async sendCheer(
    senderId: number,
    receiverId: number,
    messageType: CheerMessageType
  ): Promise<number> {
    // 验证消息类型
    if (!PRESET_CHEER_MESSAGES[messageType]) {
      throw new Error('无效的消息类型');
    }

    // 不能给自己发加油
    if (senderId === receiverId) {
      throw new Error('不能给自己发加油');
    }

    const sql = `
      INSERT INTO cheers (sender_id, receiver_id, message_type, is_read)
      VALUES (?, ?, ?, 0)
    `;
    const lastId = await db.execute(sql, [senderId, receiverId, messageType]);
    return lastId;
  }

  /**
   * 获取用户收到的加油消息
   */
  static async getReceivedCheers(userId: number, limit: number = 20): Promise<CheerWithSender[]> {
    const sql = `
      SELECT
        c.id,
        c.sender_id,
        c.receiver_id,
        c.message_type,
        c.is_read,
        c.created_at,
        u.username as sender_username,
        u.avatar as sender_avatar
      FROM cheers c
      JOIN users u ON c.sender_id = u.id
      WHERE c.receiver_id = ?
      ORDER BY c.created_at DESC
      LIMIT ?
    `;
    const cheers = await db.query(sql, [userId, limit]);

    // 添加消息内容
    return cheers.map((cheer: any) => ({
      ...cheer,
      is_read: !!cheer.is_read,
      message: PRESET_CHEER_MESSAGES[cheer.message_type] || '加油！'
    }));
  }

  /**
   * 获取用户发送的加油消息
   */
  static async getSentCheers(userId: number, limit: number = 20): Promise<any[]> {
    const sql = `
      SELECT
        c.id,
        c.sender_id,
        c.receiver_id,
        c.message_type,
        c.is_read,
        c.created_at,
        u.username as receiver_username,
        u.avatar as receiver_avatar
      FROM cheers c
      JOIN users u ON c.receiver_id = u.id
      WHERE c.sender_id = ?
      ORDER BY c.created_at DESC
      LIMIT ?
    `;
    const cheers = await db.query(sql, [userId, limit]);

    return cheers.map((cheer: any) => ({
      ...cheer,
      is_read: !!cheer.is_read,
      message: PRESET_CHEER_MESSAGES[cheer.message_type] || '加油！'
    }));
  }

  /**
   * 标记加油消息为已读
   */
  static async markAsRead(cheerId: number, userId: number): Promise<void> {
    const sql = `
      UPDATE cheers
      SET is_read = 1
      WHERE id = ? AND receiver_id = ?
    `;
    await db.execute(sql, [cheerId, userId]);
  }

  /**
   * 标记所有加油消息为已读
   */
  static async markAllAsRead(userId: number): Promise<void> {
    const sql = `
      UPDATE cheers
      SET is_read = 1
      WHERE receiver_id = ? AND is_read = 0
    `;
    await db.execute(sql, [userId]);
  }

  /**
   * 获取未读加油消息数量
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM cheers
      WHERE receiver_id = ? AND is_read = 0
    `;
    const result = await db.get(sql, [userId]);
    return result.count;
  }

  /**
   * 检查用户是否可以发送加油（限制频率）
   * 每小时最多给同一用户发送3次
   */
  static async canSendCheer(senderId: number, receiverId: number): Promise<{ canSend: boolean; reason?: string }> {
    const sql = `
      SELECT COUNT(*) as count
      FROM cheers
      WHERE sender_id = ?
        AND receiver_id = ?
        AND created_at > datetime('now', '-1 hour')
    `;
    const result = await db.get(sql, [senderId, receiverId]);

    if (result.count >= 3) {
      return { canSend: false, reason: '每小时最多给同一好友发送3次加油' };
    }

    return { canSend: true };
  }

  /**
   * 获取可用的加油消息类型列表
   */
  static getAvailableMessageTypes(): { type: string; message: string }[] {
    return Object.entries(PRESET_CHEER_MESSAGES).map(([type, message]) => ({
      type,
      message
    }));
  }
}

export default CheerModel;