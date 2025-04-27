import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SummarizationService } from './services/summarization.service';

@Controller('todo')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly summarizationService: SummarizationService,
  ) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get()
  findAll(@GetUser() user: any) {
    return this.todoService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoService.remove(id);
  }

  @Get('summarize')
  async summarizeTodos(@GetUser() user: any) {
    try {
      if (!user || !user._id) {
        throw new Error('User not authenticated or invalid user object');
      }
      
      const todos = await this.todoService.findAll(user);
      if (!todos || todos.length === 0) {
        return { summary: 'No todos found to summarize.' };
      }

      const summary = await this.summarizationService.summarizeTodos(todos.map(todo => ({
        title: todo.title,
        description: todo.description || '',
        completed: todo.completed
      })));
      return { summary };
    } catch (error) {
      console.error('Error in summarizeTodos endpoint:', error);
      throw error;
    }
  }
}
