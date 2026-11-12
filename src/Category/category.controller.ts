import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CategoryInput,
  CategoryService,
  CategoryUpdate,
} from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.categoryService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.categoryService.findById(Number(id));
  }

  @Post()
  async create(@Body() body: CategoryInput) {
    return this.categoryService.createCategory(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CategoryUpdate,
  ) {
    return this.categoryService.updateCategory(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(Number(id));
  }
}
