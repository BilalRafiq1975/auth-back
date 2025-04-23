import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, UnauthorizedException } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '../users/user.schema';

@Controller('todos')
export class TodosController {
  private readonly logger = new Logger(TodosController.name);

  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @GetUser() user: User,
  ) {
    if (!user) {
      this.logger.error('No user found in request');
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.log(`User ${user._id} is creating a new todo`);
    const todo = await this.todosService.create(createTodoDto, user);
    this.logger.log(`Todo created with ID: ${todo._id} for user ${user._id}`);
    return todo;
  }

  @Get()
  async findAll(@GetUser() user: User) {
    if (!user) {
      this.logger.error('No user found in request');
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.log(`User ${user._id} is fetching all todos`);
    const todos = await this.todosService.findAll(user);
    this.logger.log(`Found ${todos.length} todos for user ${user._id}`);
    return todos;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    if (!user) {
      this.logger.error('No user found in request');
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.log(`User ${user._id} is fetching todo with ID: ${id}`);
    const todo = await this.todosService.findOne(id, user);
    this.logger.log(`Todo found: ${todo._id} for user ${user._id}`);
    return todo;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @GetUser() user: User,
  ) {
    if (!user) {
      this.logger.error('No user found in request');
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.log(`User ${user._id} is updating todo with ID: ${id}`);
    const todo = await this.todosService.update(id, updateTodoDto, user);
    this.logger.log(`Todo updated: ${todo._id} for user ${user._id}`);
    return todo;
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    if (!user) {
      this.logger.error('No user found in request');
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.log(`User ${user._id} is deleting todo with ID: ${id}`);
    await this.todosService.remove(id, user);
    this.logger.log(`Todo deleted: ${id} for user ${user._id}`);
    return { message: 'Todo deleted successfully' };
  }
} 