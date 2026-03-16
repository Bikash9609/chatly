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

// ---------------------------------------------------------------------------
// AffiliateLink — link configuration per topic
// ---------------------------------------------------------------------------
export interface IAffiliateLink extends Document {
  topic: string;
  url: string;
  title: string;
  imageUrl?: string;
  clicks: number;
  active: boolean;
}

const AffiliateLinkSchema = new Schema<IAffiliateLink>({
  topic:    { type: String, required: true, index: true },
  url:      { type: String, required: true },
  title:    { type: String, required: true },
  imageUrl: { type: String },
  clicks:   { type: Number, default: 0 },
  active:   { type: Boolean, default: true },
});

export const AffiliateLink = mongoose.model<IAffiliateLink>('AffiliateLink', AffiliateLinkSchema);

// ---------------------------------------------------------------------------
// ClickLog — tracks every affiliate click for UTM analytics
// ---------------------------------------------------------------------------
export interface IClickLog extends Document {
  uuid: string;
  linkId: mongoose.Types.ObjectId;
  utmSource: string;
  topic: string;
  createdAt: Date;
}

const ClickLogSchema = new Schema<IClickLog>({
  uuid:      { type: String, required: true },
  linkId:    { type: Schema.Types.ObjectId, ref: 'AffiliateLink', required: true },
  utmSource: { type: String, default: 'direct' },
  topic:     { type: String },
  createdAt: { type: Date, default: () => new Date() },
});

export const ClickLog = mongoose.model<IClickLog>('ClickLog', ClickLogSchema);

