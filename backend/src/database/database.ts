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

    console.log('✅ 数据表创建成功');
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('数据库未初始化');
    return this.db.all(sql, params);
  }

  async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.db) throw new Error('数据库未初始化');
    const result = await this.db.run(sql, params);
    return result.lastID;
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
