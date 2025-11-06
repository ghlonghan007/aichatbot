import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  name: string;
  email?: string;
  apiKeys: {
    openai?: string;
    azure?: string;
  };
  preferences: {
    selectedAvatar: string;
    theme: string;
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: '用户',
    },
    email: {
      type: String,
      sparse: true,
    },
    apiKeys: {
      openai: {
        type: String,
        select: false, // 默认不返回敏感信息
      },
      azure: {
        type: String,
        select: false,
      },
    },
    preferences: {
      selectedAvatar: {
        type: String,
        default: '12',
      },
      theme: {
        type: String,
        default: 'dark',
      },
      language: {
        type: String,
        default: 'zh-CN',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);

