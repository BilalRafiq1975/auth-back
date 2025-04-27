import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({timestamps: true})
export class User extends Document{
    @Prop({ required: true, unique: true})
    email: string;

    @Prop({ required: true})
    password: string;

    @Prop({required: true})
    name: string;

    @Prop({ 
        type: String, 
        enum: ['user', 'admin'],
        default: 'user'
    })
    role: string;

    @Prop({ 
        type: Boolean,
        default: true
    })
    isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
