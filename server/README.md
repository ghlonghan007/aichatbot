# 3D AI Pet - Backend Server

基于 Node.js + Express + TypeScript + MongoDB 的后端服务，为 3D AI Pet 提供用户管理、记忆系统、对话历史和 AI 集成。

## 📦 技术栈

- **Node.js** - 运行时环境
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **MongoDB** - 数据库
- **Mongoose** - ODM
- **OpenAI** - AI 服务
- **JWT** - 认证
- **AES-256-CBC** - API Key 加密

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/3d-ai-pet

# Security
JWT_SECRET=your-secret-key-change-this-in-production
ENCRYPTION_KEY=your-32-character-encryption-key

# OpenAI (Optional - for default fallback)
DEFAULT_OPENAI_KEY=sk-your-openai-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. 启动 MongoDB

确保 MongoDB 正在运行：

```bash
# 使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 或使用本地安装的 MongoDB
mongod
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
server/
├── src/
│   ├── index.ts              # 入口文件
│   ├── models/               # 数据模型
│   │   ├── User.ts           # 用户模型
│   │   ├── Memory.ts         # 记忆模型
│   │   └── Conversation.ts   # 对话模型
│   ├── routes/               # API 路由
│   │   ├── user.ts           # 用户路由
│   │   ├── memory.ts         # 记忆路由
│   │   ├── conversation.ts   # 对话路由
│   │   └── ai.ts             # AI 路由
│   ├── middleware/           # 中间件
│   │   └── auth.ts           # 认证中间件
│   └── utils/                # 工具函数
│       ├── encryption.ts     # 加密工具
│       └── openai.ts         # OpenAI 集成
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔌 API 端点

### 用户相关

- `POST /api/user/register` - 注册/登录用户
- `GET /api/user/:userId` - 获取用户信息
- `PUT /api/user/:userId` - 更新用户信息
- `PUT /api/user/:userId/apikey` - 更新 API Key
- `GET /api/user/:userId/apikey/:provider` - 获取 API Key

### 记忆相关

- `POST /api/memory` - 创建记忆
- `GET /api/memory/:userId` - 获取记忆列表
- `GET /api/memory/:userId/search` - 搜索记忆
- `DELETE /api/memory/:id` - 删除记忆
- `POST /api/memory/batch-delete` - 批量删除记忆

### 对话相关

- `POST /api/conversation` - 创建对话
- `GET /api/conversation/:userId` - 获取对话列表
- `GET /api/conversation/detail/:id` - 获取对话详情
- `POST /api/conversation/:id/message` - 添加消息
- `PUT /api/conversation/:id/title` - 更新对话标题
- `DELETE /api/conversation/:id` - 删除对话

### AI 相关

- `POST /api/ai/chat` - 聊天补全（支持流式）
- `POST /api/ai/test-key` - 测试 API Key

## 🔐 安全性

- **API Key 加密**：所有 API Key 使用 AES-256-CBC 加密存储
- **JWT 认证**：支持 JWT token 认证
- **CORS 配置**：限制跨域访问
- **环境变量**：敏感信息存储在环境变量中

## 🧪 测试 API

使用健康检查端点：

```bash
curl http://localhost:3001/health
```

测试用户注册：

```bash
curl -X POST http://localhost:3001/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","name":"测试用户"}'
```

## 📝 注意事项

1. **MongoDB**：确保 MongoDB 正在运行
2. **API Key**：至少配置一个 OpenAI API Key（系统默认或用户自定义）
3. **加密密钥**：生产环境必须更改 `ENCRYPTION_KEY`
4. **JWT Secret**：生产环境必须更改 `JWT_SECRET`

## 🐛 常见问题

### MongoDB 连接失败

确保 MongoDB 正在运行并且连接字符串正确：

```bash
# 检查 MongoDB 状态
mongosh --eval "db.adminCommand('ping')"
```

### OpenAI API 错误

1. 检查 API Key 是否有效
2. 检查账户余额
3. 检查网络连接

## 📄 许可

MIT License

