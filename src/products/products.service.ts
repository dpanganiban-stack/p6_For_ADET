import { Injectable } from '@nestjs/common';
import { OkPacket, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

export type ProductInput = {
  product_price?: number;
  product_name?: string;
  id?: number;
  category_id?: number;
};

@Injectable()
export class ProductsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createProduct(product: ProductInput) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO products (product_price, product_name, id, category_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [
        product.product_price ?? null,
        product.product_name ?? null,
        product.id ?? null,
        product.category_id ?? null,
      ],
    );
    return { product_id: result.insertId, ...product };
  }

  async findById(productId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE product_id = ?',
      [productId],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM products',
    );
    return rows;
  }

  async updateProduct(productId: number, partial: ProductInput) {
    const fields: string[] = [];
    const values: (number | string | null)[] = [];

    if (partial.product_price !== undefined) {
      fields.push('product_price = ?');
      values.push(partial.product_price);
    }
    if (partial.product_name !== undefined) {
      fields.push('product_name = ?');
      values.push(partial.product_name);
    }
    if (partial.id !== undefined) {
      fields.push('id = ?');
      values.push(partial.id);
    }
    if (partial.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(partial.category_id);
    }

    if (fields.length === 0) return this.findById(productId);

    fields.push('updated_at = NOW()');
    values.push(productId);
    await this.pool().execute(
      `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`,
      values,
    );
    return this.findById(productId);
  }

  async deleteProduct(productId: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM products WHERE product_id = ?',
      [productId],
    );
    return result.affectedRows > 0;
  }
}
