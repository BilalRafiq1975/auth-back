import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from './entities/todo.entity';
import { Model } from 'mongoose';

@Injectable()
export class TodoService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto) {
    const createdTodo = new this.todoModel(createTodoDto);
    return createdTodo.save();
  }

  async findAll(user: any) {
    try {
      if (!user || !user._id) {
        throw new Error('Invalid user object');
      }
      return this.todoModel.find({ userId: user._id }).exec();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    return this.todoModel.findById(id).exec();
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    return this.todoModel.findByIdAndUpdate(id, updateTodoDto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.todoModel.findByIdAndDelete(id).exec();
  }
}
