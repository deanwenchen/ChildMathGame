import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private db: Database | null = null;

  private constructor() {}

  public static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await open({
      filename: './data/arithmetic.db',
      driver: sqlite3.Database
    });

    await this.createTables();
    console.log('✅ SQLite数据库初始化成功');
  }

  private async createTables(): Promise<void> {
    // 创建用户表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        age INTEGER NOT NULL,
        grade INTEGER NOT NULL,
        avatar TEXT DEFAULT 'default',
        total_points INTEGER DEFAULT 0,
        status TEXT DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'busy')),
        parent_approval INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建成绩表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
        operation_type TEXT NOT NULL CHECK(operation_type IN ('addition', 'subtraction', 'multiplication', 'division')),
        total_questions INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        score INTEGER NOT NULL,
        time_spent INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // 创建好友关系表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS friendships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id INTEGER NOT NULL,
        addressee_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'blocked')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(requester_id, addressee_id)
      )
    `);

    // 创建加油消息表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS cheers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        message_type TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // 创建排行榜表
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS leaderboard_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        username TEXT NOT NULL,
        total_points INTEGER DEFAULT 0,
        weekly_points INTEGER DEFAULT 0,
        monthly_points INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        quick_answers INTEGER DEFAULT 0,
        max_combo INTEGER DEFAULT 0,
        pk_wins INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // 创建排行榜索引
    await this.db!.exec(`
      CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly
      ON leaderboard_entries(weekly_points DESC)
    `);
    await this.db!.exec(`
      CREATE INDEX IF NOT EXISTS idx_leaderboard_monthly
      ON leaderboard_entries(monthly_points DESC)
    `);
    await this.db!.exec(`
      CREATE INDEX IF NOT EXISTS idx_leaderboard_total
      ON leaderboard_entries(total_points DESC)
    `);

    console.log('✅ 数据表创建成功');
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('数据库未初始化');
    return this.db.all(sql, params);
  }

  async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.db) throw new Error('数据库未初始化');
    const result = await this.db.run(sql, params);
    return result.lastID ?? 0;
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('数据库未初始化');
    return this.db.get(sql, params);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export default SQLiteDatabase.getInstance();
