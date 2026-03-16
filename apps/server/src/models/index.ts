import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Session — one per anonymous user (identified by UUID)
// ---------------------------------------------------------------------------
export interface ISession extends Document {
  uuid: string;
  karma: number;
  skipCount: number;
  skipResetAt: Date;
  shadowbanned: boolean;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  uuid:          { type: String, required: true, unique: true, index: true },
  karma:         { type: Number, default: 0 },
  skipCount:     { type: Number, default: 0 },
  skipResetAt:   { type: Date, default: () => new Date() },
  shadowbanned:  { type: Boolean, default: false },
  createdAt:     { type: Date, default: () => new Date() },
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);

// ---------------------------------------------------------------------------
// ChatLog — one per completed room
// ---------------------------------------------------------------------------
export interface IChatLog extends Document {
  roomId: string;
  participants: string[];
  topic: string;
  icebreakerPrompt: string;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
}

const ChatLogSchema = new Schema<IChatLog>({
  roomId:           { type: String, required: true, index: true },
  participants:     [{ type: String }],
  topic:            { type: String },
  icebreakerPrompt: { type: String },
  startedAt:        { type: Date, default: () => new Date() },
  endedAt:          { type: Date },
  durationSeconds:  { type: Number },
});

export const ChatLog = mongoose.model<IChatLog>('ChatLog', ChatLogSchema);

// ---------------------------------------------------------------------------
// Feedback — one per user per room
// ---------------------------------------------------------------------------
export interface IFeedback extends Document {
  roomId: string;
  fromUuid: string;
  rating: 'good' | 'boring' | 'creepy';
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  roomId:    { type: String, required: true, index: true },
  fromUuid:  { type: String, required: true },
  rating:    { type: String, enum: ['good', 'boring', 'creepy'], required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
