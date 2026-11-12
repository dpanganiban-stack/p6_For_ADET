import { Injectable } from '@nestjs/common';
import { OkPacket, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

export type CategoryInput = {
  category_name: string;
  description?: string | null;
};

export type CategoryUpdate = {
  category_name?: string;
  description?: string | null;
};

@Injectable()
export class CategoryService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createCategory(category: CategoryInput) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO categories (category_name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [category.category_name, category.description ?? null],
    );
    return { category_id: result.insertId, ...category };
  }

  async findById(categoryId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM categories WHERE category_id = ?',
      [categoryId],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM categories',
    );
    return rows;
  }

  async updateCategory(categoryId: number, partial: CategoryUpdate) {
    const fields: string[] = [];
    const values: (string | null | number)[] = [];

    if (partial.category_name !== undefined) {
      fields.push('category_name = ?');
      values.push(partial.category_name);
    }
    if (partial.description !== undefined) {
      fields.push('description = ?');
      values.push(partial.description);
    }

    if (fields.length === 0) return this.findById(categoryId);

    fields.push('updated_at = NOW()');
    values.push(categoryId);
    await this.pool().execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE category_id = ?`,
      values,
    );
    return this.findById(categoryId);
  }

  async deleteCategory(categoryId: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM categories WHERE category_id = ?',
      [categoryId],
    );
    return result.affectedRows > 0;
  }
}
