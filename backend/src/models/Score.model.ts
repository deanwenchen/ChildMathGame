import db from '../database/database';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface Score {
  id?: number;
  user_id: number;
  difficulty: Difficulty;
  operation_type: OperationType;
  total_questions: number;
  correct_count: number;
  score: number;
  time_spent: number;
  created_at?: string;
}

export class ScoreModel {
  static async create(score: Omit<Score, 'id' | 'created_at'>): Promise<number> {
    const sql = `
      INSERT INTO scores (
        user_id, difficulty, operation_type,
        total_questions, correct_count, score, time_spent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const lastId = await db.execute(sql, [
      score.user_id,
      score.difficulty,
      score.operation_type,
      score.total_questions,
      score.correct_count,
      score.score,
      score.time_spent
    ]);
    return lastId;
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<Score[]> {
    const sql = `
      SELECT * FROM scores
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
    const scores = await db.query(sql, [userId, limit]);
    return scores;
  }

  static async getSummaryByUserId(userId: number): Promise<any> {
    const sql = `
      SELECT
        COUNT(*) as total_sessions,
        SUM(total_questions) as total_questions,
        SUM(correct_count) as total_correct,
        AVG(score) as avg_score,
        MIN(score) as min_score,
        MAX(score) as max_score,
        COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy_count,
        COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_count
      FROM scores
      WHERE user_id = ?
    `;
    const summary = await db.get(sql, [userId]);
    return summary;
  }

  static async getRecentScores(userId: number, limit: number = 10): Promise<Score[]> {
    const sql = `
      SELECT * FROM scores
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
    const scores = await db.query(sql, [userId, limit]);
    return scores;
  }

  static async deleteById(id: number): Promise<void> {
    const sql = 'DELETE FROM scores WHERE id = ?';
    await db.execute(sql, [id]);
  }
}

export default ScoreModel;
