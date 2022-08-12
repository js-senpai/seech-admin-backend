import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './users.schema';
import { Ticket } from './ticket.schema';

export type SelectedSaleTicketsDocument = SelectedSaleTickets & Document;

@Schema({
  collection: 'selectedSaleTickets',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class SelectedSaleTickets {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true })
  userId: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  })
  tickets: Ticket[];
}

export const SelectedSaleTicketsSchema =
  SchemaFactory.createForClass(SelectedSaleTickets);
