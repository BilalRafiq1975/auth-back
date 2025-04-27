import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './todo.schema';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { SummarizationService } from './services/summarization.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
  ],
  controllers: [TodosController],
  providers: [TodosService, SummarizationService],
  exports: [TodosService],
})
export class TodosModule {} 