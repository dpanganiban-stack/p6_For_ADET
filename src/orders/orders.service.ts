import { Injectable } from '@nestjs/common';
import { OkPacket, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

export type OrderInput = {
  id: number;
  total_amount: number;
  order_status?: string;
};

export type OrderUpdate = {
  id?: number;
  total_amount?: number;
  order_status?: string;
};

@Injectable()
export class OrdersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createOrder(order: OrderInput) {
    const includeStatus = order.order_status !== undefined;
    const values: (number | string)[] = [order.id, order.total_amount];
    if (order.order_status !== undefined) {
      values.push(order.order_status);
    }

    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO orders (id, total_amount${includeStatus ? ', order_status' : ''})
       VALUES (?, ?${includeStatus ? ', ?' : ''})`,
      values,
    );
    return { order_id: result.insertId, ...order };
  }

  async findById(orderId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM orders',
    );
    return rows;
  }

  async updateOrder(orderId: number, partial: OrderUpdate) {
    const fields: string[] = [];
    const values: (number | string)[] = [];

    if (partial.id !== undefined) {
      fields.push('id = ?');
      values.push(partial.id);
    }
    if (partial.total_amount !== undefined) {
      fields.push('total_amount = ?');
      values.push(partial.total_amount);
    }
    if (partial.order_status !== undefined) {
      fields.push('order_status = ?');
      values.push(partial.order_status);
    }

    if (fields.length === 0) return this.findById(orderId);

    values.push(orderId);
    await this.pool().execute(
      `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ?`,
      values,
    );
    return this.findById(orderId);
  }

  async deleteOrder(orderId: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM orders WHERE order_id = ?',
      [orderId],
    );
    return result.affectedRows > 0;
  }
}
