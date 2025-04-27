import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { SummarizationService } from './services/summarization.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './entities/todo.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
  ],
  controllers: [TodoController],
  providers: [TodoService, SummarizationService],
  exports: [TodoService, SummarizationService],
})
export class TodoModule {}
