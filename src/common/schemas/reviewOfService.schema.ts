import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './users.schema';
import * as mongoose from 'mongoose';

export type ReviewOfServiceDocument = ReviewOfService & Document;

@Schema({
  collection: 'reviewOfService',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class ReviewOfService {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: String, unique: true })
  uniqueId: string;

  @Prop({ type: Boolean, default: false })
  done: boolean;

  @Prop({ type: String, required: true, default: '' })
  text: string;

  @Prop({
    type: Number,
    default: 1,
    validate: {
      validator(value) {
        return value >= 1 && value <= 5;
      },
      message: (props) => `${props.value} is not a valid`,
    },
  })
  value: number;
}

export const ReviewOfServiceSchema =
  SchemaFactory.createForClass(ReviewOfService);
