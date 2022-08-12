import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './users.schema';
import { Ticket } from './ticket.schema';

export type SelectedBuyTicketsDocument = SelectedBuyTickets & Document;

@Schema({
  collection: 'selectedBuyTickets',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class SelectedBuyTickets {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true })
  userId: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  })
  tickets: Ticket[];
}

export const SelectedBuyTicketsSchema =
  SchemaFactory.createForClass(SelectedBuyTickets);
