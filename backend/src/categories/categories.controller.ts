import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { CategoryDto } from './dto/category.dto';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  @Get() findAll() {
    return this.categories.findAll();
  }
  @Post() create(@Body() input: CategoryDto) {
    return this.categories.create(input);
  }
  @Get(':id') findById(@Param('id') id: string) {
    return this.categories.findById(id);
  }
  @Patch(':id') update(@Param('id') id: string, @Body() input: CategoryDto) {
    return this.categories.update(id, input);
  }
  @Delete(':id') @UseGuards(RolesGuard) @Roles(UserRole.ADMIN) async delete(
    @Param('id') id: string,
  ) {
    await this.categories.delete(id);
    return { deleted: true };
  }
}
