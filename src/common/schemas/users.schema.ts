import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { AvailableTickets } from './availableTickets.schema';
import { Ticket } from './ticket.schema';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class User {
  @Prop({ unique: true, required: true, type: Number })
  userId: number;

  @Prop({ type: String })
  name: string;

  @Prop({ type: Number })
  phone: number;

  @Prop({ type: String, required: true, default: 'free' })
  state: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' })
  ticket: Ticket;

  @Prop({ type: [{ data: { type: Date }, id: { type: String } }] })
  basket: {
    data: Date;
    id: string;
  }[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AvailableTickets' }],
  })
  availableTickets: AvailableTickets[];

  @Prop({ type: Boolean, required: true, default: false })
  personalDataProcessing: boolean;

  @Prop({ type: Number })
  region: number;

  @Prop({ type: String, default: '-' })
  countryState: string;

  @Prop({ type: String, default: '-' })
  countryOtg: string;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  reviewsNumber: number;

  @Prop({ type: String, default: 'user' })
  type: string;

  @Prop({ type: String, default: 'mainMenu' })
  prevMenu: string;

  @Prop({ type: Boolean, default: false })
  disablePurchaseNotification: boolean;

  @Prop({ type: Boolean, default: false })
  disableBuyNotification: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
