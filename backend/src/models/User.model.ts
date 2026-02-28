import db from '../database/database';

export interface User {
  id?: number;
  username: string;
  age: number;
  grade: number;
  created_at?: string;
}

export class UserModel {
  static async create(user: Omit<User, 'id' | 'created_at'>): Promise<number> {
    const sql = `
      INSERT INTO users (username, age, grade)
      VALUES (?, ?, ?)
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
}

export default UserModel;
