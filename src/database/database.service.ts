import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: mysql.Pool;

  async onModuleInit() {
    const port = Number(process.env.DB_PORT || 3306);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DB_PORT must be a valid TCP port number');
    }

    this.pool = mysql.createPool({
      host: this.requiredEnv('DB_HOST'),
      port,
      user: this.requiredEnv('DB_USER'),
      password: this.requiredEnv('DB_PASSWORD'),
      database: this.requiredEnv('DB_NAME'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    try {
      const connection = await this.pool.getConnection();
      try {
        await connection.ping();
      } finally {
        connection.release();
      }
    } catch (error) {
      await this.pool.end();
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getPool() {
    return this.pool;
  }

  private requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }
}
