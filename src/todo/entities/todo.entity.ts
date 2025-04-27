import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema()
export class Todo {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
