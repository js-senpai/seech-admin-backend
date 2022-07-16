import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './users.schema';

export type AvailableTicketsDocument = AvailableTickets & Document;

@Schema({
  collection: 'availableTickets',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class AvailableTickets {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: Boolean, default: false })
  done: boolean;

  @Prop({
    type: Number,
    default: 0,
    validate: {
      validator(value) {
        return value >= 0;
      },
      message: (props) => `${props.value} is not a valid`,
    },
  })
  totalNumber: number;

  @Prop({
    type: Number,
    default: 5,
    validate: {
      validator(value) {
        return value >= 0;
      },
      message: (props) => `${props.value} is not a valid`,
    },
  })
  availableNumber: number;
}

export const AvailableTicketsSchema =
  SchemaFactory.createForClass(AvailableTickets);
