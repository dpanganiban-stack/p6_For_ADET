import { Module } from '@nestjs/common';
import { CategoryModule } from './Category/category.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    CategoryModule,
    ProductsModule,
    OrdersModule,
  ],
})

export class AppModule {}