import db from '../database/database';

export interface WrongQuestion {
  id?: number;
  user_id: number;
  expression: string;
  user_answer: number;
  correct_answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  operation_type: 'addition' | 'subtraction' | 'multiplication' | 'division';
  review_count: number;
  mastered: boolean;
  created_at?: string;
  updated_at?: string;
}

export class WrongQuestionModel {
  // 创建错题
  static async create(wrongQuestion: Omit<WrongQuestion, 'id' | 'created_at' | 'updated_at' | 'review_count' | 'mastered'>): Promise<number> {
    const sql = `
      INSERT INTO wrong_questions (
        user_id, expression, user_answer, correct_answer,
        difficulty, operation_type
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const lastId = await db.execute(sql, [
      wrongQuestion.user_id,
      wrongQuestion.expression,
      wrongQuestion.user_answer,
      wrongQuestion.correct_answer,
      wrongQuestion.difficulty,
      wrongQuestion.operation_type
    ]);
    return lastId;
  }

  // 查找用户的所有错题
  static async findByUserId(userId: number): Promise<WrongQuestion[]> {
    const sql = `
      SELECT * FROM wrong_questions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const questions = await db.query(sql, [userId]);
    return questions;
  }

  // 查找未掌握的错题
  static async findUnmasteredByUserId(userId: number): Promise<WrongQuestion[]> {
    const sql = `
      SELECT * FROM wrong_questions
      WHERE user_id = ? AND mastered = 0
      ORDER BY created_at DESC
    `;
    const questions = await db.query(sql, [userId]);
    return questions;
  }

  // 按运算类型查找错题
  static async findByOperationType(
    userId: number,
    operationType: string
  ): Promise<WrongQuestion[]> {
    const sql = `
      SELECT * FROM wrong_questions
      WHERE user_id = ? AND operation_type = ?
      ORDER BY created_at DESC
    `;
    const questions = await db.query(sql, [userId, operationType]);
    return questions;
  }

  // 增加复习次数
  static async incrementReviewCount(id: number): Promise<void> {
    const sql = `
      UPDATE wrong_questions
      SET review_count = review_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.execute(sql, [id]);
  }

  // 标记为已掌握
  static async setMastered(id: number, mastered: boolean): Promise<void> {
    const sql = `
      UPDATE wrong_questions
      SET mastered = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.execute(sql, [mastered ? 1 : 0, id]);
  }

  // 删除错题
  static async deleteById(id: number): Promise<void> {
    const sql = 'DELETE FROM wrong_questions WHERE id = ?';
    await db.execute(sql, [id]);
  }

  // 批量删除错题
  static async deleteByUserIds(ids: number[]): Promise<void> {
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM wrong_questions WHERE id IN (${placeholders})`;
    await db.execute(sql, ids);
  }

  // 获取错题统计
  static async getStatsByUserId(userId: number): Promise<any> {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN mastered = 1 THEN 1 ELSE 0 END) as mastered_count,
        SUM(CASE WHEN mastered = 0 THEN 1 ELSE 0 END) as unmastered_count,
        AVG(review_count) as avg_reviews,
        COUNT(CASE WHEN operation_type = 'addition' THEN 1 END) as addition_count,
        COUNT(CASE WHEN operation_type = 'subtraction' THEN 1 END) as subtraction_count,
        COUNT(CASE WHEN operation_type = 'multiplication' THEN 1 END) as multiplication_count,
        COUNT(CASE WHEN operation_type = 'division' THEN 1 END) as division_count
      FROM wrong_questions
      WHERE user_id = ?
    `;
    const stats = await db.get(sql, [userId]);
    return stats;
  }
}

export default WrongQuestionModel;
