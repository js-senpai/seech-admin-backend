import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TicketDocument = Ticket & Document;

@Schema({
  collection: 'tickets',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Ticket {
  @Prop({ type: Number })
  authorId: number;

  @Prop({ type: Boolean })
  sale: boolean;

  @Prop({ type: String, default: 'kilogram' })
  weightType: string;

  @Prop({ type: Number })
  weight: number;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String })
  culture: string;

  @Prop({ type: String })
  photoUrl: string;

  @Prop({ type: String })
  photo: string;

  @Prop({ type: Date })
  date: Date;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Boolean, default: false })
  waitingForReview: boolean;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Number, default: 0 })
  numberOfExtends: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
