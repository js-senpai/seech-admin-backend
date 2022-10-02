import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './users.schema';
import * as mongoose from 'mongoose';

export type ReviewOfSellerDocument = ReviewOfSeller & Document;

@Schema({
  collection: 'reviewOfSeller',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class ReviewOfSeller {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  buyerId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sellerId: User;

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

export const ReviewOfSellerSchema =
  SchemaFactory.createForClass(ReviewOfSeller);
