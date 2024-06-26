import { QueryResult, RowDataPacket, OkPacket } from 'mysql2';
import {pool, connectToDatabase} from './DatabaseService';
import Exam from '../models/Exam';
import Choice from '../models/Choice';

interface CountResult {
  hitcount: number;
}

class ExamService {
  async getExamCount(keyword: string): Promise<number> {
    let sql = `
      SELECT
        COUNT(DISTINCT e.id) AS hitcount
      FROM exam e
      JOIN choice c ON e.id = c.exam_id
    `;
    
    const params: string[] = [];

    if (keyword.trim() !== '') {
      // 検索キーワードが空文字出なければ条件追加
      sql += `
        WHERE
          e.question_text LIKE ?
          OR e.explanation LIKE ?
          OR c.choice_text LIKE ?
      `;

      // パラメータにキーワードを追加
      params.push(
          `%${keyword}%`,
          `%${keyword}%`,
          `%${keyword}%`
      );
    }

    try {
      const results: CountResult[] = await new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results as CountResult[]);
          }
        });
      });

      return results[0].hitcount as number;
    } catch (error) {
      throw new Error('Database error');
    }
  }

  getExams(keyword: string, page: number): Promise<QueryResult> {
    const offset = (page - 1) * 10
    let sql = `
      SELECT
        DISTINCT e.id, e.exam_type, e.round, e.subject, e.question_number, e.question_text
      FROM exam e
      JOIN choice c ON e.id = c.exam_id
    `;
    
    const params: string[] = [];

    if (keyword.trim() !== '') {
      // 検索キーワードが空文字出なければ条件追加
      sql += `
        WHERE
          e.question_text LIKE ?
          OR e.explanation LIKE ?
          OR c.choice_text LIKE ?
      `;

      // パラメータにキーワードを追加
      params.push(
          `%${keyword}%`,
          `%${keyword}%`,
          `%${keyword}%`
      );
    }
    sql += `
      ORDER BY exam_type, round, subject, question_number
      LIMIT 10 OFFSET ${offset}
    `;
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getExam(id: string): Promise<Exam[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          id, exam_type, round, subject, question_number, question_text,
          answer, explanation, difficulty_level
        FROM exam  WHERE id=:id
      `;
      pool.query(sql, {id: id}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results as Exam[]);
        }
      });
    });
  }

  getChoices(id: string): Promise<{id: string, choice_text: string}[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          id, choice_text
        FROM choice WHERE exam_id=:id
      `;
      pool.query(sql, {id: id}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results as {id: string, choice_text: string}[]);
        }
      });
    });
  }

  async createExam(exam: Exam, choices: Choice[]) {
    const connection = await connectToDatabase();
    try {
      // トランザクション開始
      await connection.beginTransaction();
  
      // 問題を挿入
      const [result] = await connection.execute(
        `
          INSERT INTO
            exam (id, exam_type, round, subject, question_number, question_text,
              answer, explanation, difficulty_level, created_by, created_at,
              updated_by, updated_at)
          VALUES (:id, :examType, :round, :subject, :questionNumber, :questionText,
            :answer, :explanation, :difficultyLevel, :createdBy, NOW(), :updatedBy, NOW())
        `,
        exam
      );

      // 選択肢を挿入
      for (const choice of choices) {
        await connection.execute(
          `
            INSERT INTO
              choice (id, exam_id, choice_text, created_by, created_at, updated_by, updated_at)
            VALUES (:id, :examId, :choiceText, :createdBy, NOW(), :updatedBy, NOW())
          `,
          choice
        );
      }

      // トランザクションコミット
      await connection.commit();
      console.log('Create exam successfully');
    } catch (error) {
      // トランザクションロールバック
      await connection.rollback();
      console.error('Error creating exam:', error);
    } finally {
      // 接続終了
      await connection.end();
    }
  }

  // updateExam(exam: Exam): Promise<QueryResult> {
  //   return new Promise((resolve, reject) => {
  //     const query = `
  //       UPDATE
  //         exam
  //       SET exam_type=:examType, round=:round, subject=:subject,
  //         question_number=:questionNumber, question_text=:questionText, choice1=:choice1,
  //         choice2=:choice2, choice3=:choice3, choice4=:choice4, choice5=:choice5, 
  //         answer=:answer, explanation=:explanation, difficulty_level=:difficultyLevel,
  //         updated_by=:updatedBy, updated_at=NOW()
  //       WHERE id=:id
  //     `;
  //     connection.query(query, exam, (error, results) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve(results);
  //       }
  //     });
  //   });
  // }

  async updateExam(exam: Exam, choices: Choice[]) {
    const connection = await connectToDatabase();
    try {
      // トランザクション開始
      await connection.beginTransaction();
  
      // 問題を更新
      const [result] = await connection.execute(
        `
          UPDATE
            exam
          SET exam_type=:examType, round=:round, subject=:subject,
            question_number=:questionNumber, question_text=:questionText, answer=:answer,
            explanation=:explanation, difficulty_level=:difficultyLevel,
            updated_by=:updatedBy, updated_at=NOW()
          WHERE id=:id
        `,
        exam
      );

      // 選択肢を更新
      for (const choice of choices) {
        await connection.execute(
          `
            UPDATE
              choice
            SET choice_text=:choiceText, updated_by=:updatedBy, updated_at=NOW()
            WHERE id=:id
          `,
          choice
        );
      }

      // トランザクションコミット
      await connection.commit();
      console.log('Update exam successfully');
    } catch (error) {
      // トランザクションロールバック
      await connection.rollback();
      console.error('Error updating exam:', error);
    } finally {
      // 接続終了
      await connection.end();
    }
  }

  // deleteExam(id: string): Promise<QueryResult> {
  //   return new Promise((resolve, reject) => {
  //     const query = `
  //       DELETE FROM
  //         exam
  //       WHERE id=:id
  //     `;
  //     pool.query(query, {id: id}, (error, results) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve(results);
  //       }
  //     });
  //   });
  // }

  async deleteExam(id: string) {
    const connection = await connectToDatabase();
    try {
      // トランザクション開始
      await connection.beginTransaction();
  
      // 選択肢削除
      const [result] = await connection.execute(
        `
          DELETE FROM
            choice
          WHERE exam_id=:id
        `,
        {id: id}
      );

      // 問題削除
      await connection.execute(
        `
          DELETE FROM
            exam
          WHERE id=:id
        `,
        {id: id}
      );

      // トランザクションコミット
      await connection.commit();
      console.log('Delete exam successfully');
    } catch (error) {
      // トランザクションロールバック
      await connection.rollback();
      console.error('Error deteting exam:', error);
    } finally {
      // 接続終了
      await connection.end();
    }
  }
}

export default ExamService;