import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from '../users/user.schema';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto, user: User): Promise<Todo> {
    this.logger.log(`Creating todo for user ${user._id}`);
    const todo = new this.todoModel({
      ...createTodoDto,
      user: user._id,
    });
    const savedTodo = await todo.save();
    this.logger.log(`Todo created successfully: ${JSON.stringify(savedTodo)}`);
    return savedTodo;
  }

  async findAll(user: User): Promise<Todo[]> {
    this.logger.log(`Finding all todos for user ${user._id}`);
    const todos = await this.todoModel.find({ user: user._id }).exec();
    this.logger.log(`Found ${todos.length} todos for user ${user._id}`);
    return todos;
  }

  async findOne(id: string, user: User): Promise<Todo> {
    this.logger.log(`Finding todo ${id} for user ${user._id}`);
    const todo = await this.todoModel.findOne({ _id: id, user: user._id }).exec();
    if (!todo) {
      this.logger.error(`Todo with ID ${id} not found for user ${user._id}`);
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    this.logger.log(`Found todo: ${JSON.stringify(todo)}`);
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, user: User): Promise<Todo> {
    this.logger.log(`Updating todo ${id} for user ${user._id}`);
    const todo = await this.todoModel
      .findOneAndUpdate(
        { _id: id, user: user._id },
        { $set: updateTodoDto },
        { new: true }
      )
      .exec();

    if (!todo) {
      this.logger.error(`Todo with ID ${id} not found for user ${user._id}`);
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    this.logger.log(`Updated todo: ${JSON.stringify(todo)}`);
    return todo;
  }

  async remove(id: string, user: User): Promise<void> {
    this.logger.log(`Removing todo ${id} for user ${user._id}`);
    const result = await this.todoModel.deleteOne({ _id: id, user: user._id }).exec();
    if (result.deletedCount === 0) {
      this.logger.error(`Todo with ID ${id} not found for user ${user._id}`);
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    this.logger.log(`Successfully deleted todo ${id} for user ${user._id}`);
  }
} 