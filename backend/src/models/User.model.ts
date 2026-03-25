import db from '../database/database';

export type UserStatus = 'online' | 'offline' | 'busy';

export interface User {
  id?: number;
  username: string;
  age: number;
  grade: number;
  avatar?: string;
  total_points?: number;
  status?: UserStatus;
  parent_approval?: boolean;
  created_at?: string;
}

// 预设头像列表（儿童友好的卡通形象）
export const ALLOWED_AVATARS = [
  'default',
  'cat',
  'dog',
  'rabbit',
  'panda',
  'lion',
  'elephant',
  'dolphin'
];

// 禁止的用户名模式（保护隐私）
const FORBIDDEN_PATTERNS = [
  /^[a-zA-Z]+$/,  // 纯英文名
  /^[\u4e00-\u9fa5]{2,4}$/,  // 中文名（2-4个汉字）
  /\d{4,}/,  // 包含4位以上数字（可能是生日/电话）
  /电话|手机|邮箱|地址/i,  // 包含联系方式关键词
];

export class UserModel {
  static async create(user: Omit<User, 'id' | 'created_at' | 'avatar' | 'total_points' | 'status' | 'parent_approval'>): Promise<number> {
    const sql = `
      INSERT INTO users (username, age, grade, avatar, total_points, status, parent_approval)
      VALUES (?, ?, ?, 'default', 0, 'offline', 0)
    `;
    const lastId = await db.execute(sql, [user.username, user.age, user.grade]);
    return lastId;
  }

  static async findById(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const user = await db.get(sql, [id]);
    return user;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const user = await db.get(sql, [username]);
    return user;
  }

  static async findAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    const users = await db.query(sql);
    return users;
  }

  static async deleteById(id: number): Promise<void> {
    const sql = 'DELETE FROM users WHERE id = ?';
    await db.execute(sql, [id]);
  }

  static async updateStatus(userId: number, status: UserStatus): Promise<void> {
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    await db.execute(sql, [status, userId]);
  }

  static async updateAvatar(userId: number, avatar: string): Promise<void> {
    if (!ALLOWED_AVATARS.includes(avatar)) {
      throw new Error('Invalid avatar selection');
    }
    const sql = 'UPDATE users SET avatar = ? WHERE id = ?';
    await db.execute(sql, [avatar, userId]);
  }

  static async addPoints(userId: number, points: number): Promise<void> {
    const sql = 'UPDATE users SET total_points = total_points + ? WHERE id = ?';
    await db.execute(sql, [points, userId]);
  }

  static async setParentApproval(userId: number, approved: boolean): Promise<void> {
    const sql = 'UPDATE users SET parent_approval = ? WHERE id = ?';
    await db.execute(sql, [approved ? 1 : 0, userId]);
  }

  static async getOnlineUsers(): Promise<User[]> {
    const sql = 'SELECT * FROM users WHERE status = ? ORDER BY username';
    const users = await db.query(sql, ['online']);
    return users;
  }

  static async getLeaderboard(limit: number = 10): Promise<User[]> {
    const sql = 'SELECT id, username, avatar, total_points FROM users ORDER BY total_points DESC LIMIT ?';
    const users = await db.query(sql, [limit]);
    return users;
  }

  static isValidUsername(username: string): { valid: boolean; reason?: string } {
    // 长度检查
    if (username.length < 2 || username.length > 12) {
      return { valid: false, reason: '用户名长度需要2-12个字符' };
    }

    // 禁止模式检查
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(username)) {
        return { valid: false, reason: '用户名不能包含真实姓名或个人信息' };
      }
    }

    // 仅允许中文、字母、数字和下划线
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, reason: '用户名只能包含中文、字母、数字和下划线' };
    }

    return { valid: true };
  }
}

export default UserModel;
