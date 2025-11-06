import mongoose, { Schema, Document } from 'mongoose';

export interface IMemory extends Document {
  userId: string;
  type: 'conversation' | 'user_info' | 'preference' | 'note';
  content: string;
  metadata: {
    tags?: string[];
    importance?: number; // 1-5
    context?: string;
  };
  timestamp: Date;
  createdAt: Date;
}

const MemorySchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['conversation', 'user_info', 'preference', 'note'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      tags: [String],
      importance: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      context: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 索引优化
MemorySchema.index({ userId: 1, timestamp: -1 });
MemorySchema.index({ userId: 1, type: 1 });

export default mongoose.model<IMemory>('Memory', MemorySchema);

