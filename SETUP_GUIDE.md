# 🚀 完整部署指南

本指南将帮助你从零开始运行 3D AI Pet 项目。

## 📋 前置条件

在开始之前，确保你的系统已安装：

1. **Node.js** (>= 18.0.0)
   ```bash
   node --version  # 应该 >= v18.0.0
   ```

2. **MongoDB** (>= 5.0)
   
   **选项 A：使用 Docker（推荐）**
   ```bash
   docker run -d \
     --name mongodb \
     -p 27017:27017 \
     -v mongodb_data:/data/db \
     mongo:latest
   ```

   **选项 B：本地安装**
   - Windows: https://www.mongodb.com/try/download/community
   - macOS: `brew install mongodb-community`
   - Linux: 参考 MongoDB 官方文档

3. **OpenAI API Key**
   - 访问 https://platform.openai.com/api-keys
   - 创建一个新的 API Key
   - 保存好，后面会用到

## 🔧 第一步：安装依赖

### 1.1 克隆仓库（如果还没有）

```bash
git clone https://github.com/ghlonghan007/aichatbot.git
cd aichatbot
```

### 1.2 安装前端依赖

```bash
npm install
```

### 1.3 安装后端依赖

```bash
cd server
npm install
cd ..
```

## ⚙️ 第二步：配置环境变量

### 2.1 后端环境变量

在 `server` 目录下创建 `.env` 文件：

```bash
cd server
```

创建 `.env` 文件，内容如下：

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/3d-ai-pet

# Security (生产环境请修改这些密钥)
JWT_SECRET=3d-ai-pet-secret-key-2024-change-in-production
ENCRYPTION_KEY=3d-ai-pet-32-chars-key-12345678

# OpenAI (可选 - 如果不设置，用户需要在前端设置中输入自己的 API Key)
DEFAULT_OPENAI_KEY=sk-your-openai-api-key-here

# CORS (允许的前端地址)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**重要提示：**
- `ENCRYPTION_KEY` 必须是 32 个字符
- `DEFAULT_OPENAI_KEY` 是可选的，如果不设置，用户需要在前端设置页面输入自己的 API Key
- 生产环境务必修改 `JWT_SECRET` 和 `ENCRYPTION_KEY`

### 2.2 前端环境变量（可选）

如果后端运行在不同的地址，在项目根目录创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:3001
```

## 🎯 第三步：启动服务

### 方式一：分别启动（推荐用于开发）

**终端 1 - 启动 MongoDB（如果使用 Docker）：**
```bash
docker start mongodb
```

**终端 2 - 启动后端：**
```bash
cd server
npm run dev
```

你应该看到：
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
```

**终端 3 - 启动前端：**
```bash
npm run dev
```

你应该看到：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 方式二：使用脚本快速启动

在项目根目录运行：

```bash
# 启动后端（新终端）
npm run server

# 启动前端（另一个新终端）
npm run dev
```

## 🧪 第四步：测试 API（可选）

在启动后端后，你可以测试 API 是否正常工作：

```bash
# 在 server 目录下运行
cd server
node test-api.js
```

如果一切正常，你会看到：
```
🧪 开始测试 API...
1️⃣ 测试健康检查...
✅ 健康检查通过
2️⃣ 测试用户注册...
✅ 用户注册成功
...
✅ 所有基础 API 测试完成！
```

## 🌐 第五步：访问应用

在浏览器中打开：

```
http://localhost:5173
```

你应该看到 3D AI Pet 界面！

## 📝 第六步：配置 OpenAI API Key（如果后端没有配置）

1. 点击右侧 **高级选项** → **⚙️ 打开设置**
2. 切换到 **API 密钥** 标签
3. 输入你的 OpenAI API Key (`sk-...`)
4. 勾选"显示密钥"确认输入正确
5. 点击 **保存 API Key**
6. 关闭设置，现在你可以和 AI 聊天了！

## 🎮 使用指南

### 基本操作

1. **选择角色**：左侧点击不同的角色卡片
2. **3D 控制**：
   - 🖱️ 鼠标拖拽：旋转视角
   - 🔄 滚轮：缩放
   - ⬅️➡️⬆️⬇️ 方向键：平移角色
   - Q / PageUp：升高
   - E / PageDown：降低

3. **聊天对话**：
   - 在中间下方的输入框输入消息
   - 按 Enter 或点击"发送"
   - AI 会自动回复并语音播放

4. **语音控制**：
   - 点击右侧"开启麦克风"
   - 说话时会自动检测（显示"检测到说话"）
   - 说话会自动打断 AI 的语音播放

5. **屏幕捕获**：
   - 点击右侧"开始捕获"
   - 选择要分享的屏幕或窗口
   - 可以将截图发送给 AI 分析

### 导入自定义 3D 角色

1. 右侧控制面板找到"导入自定义模型"
2. **从文件上传**：
   - 点击"选择文件"
   - 支持 `.glb`, `.gltf`, `.fbx`, `.obj`
3. **从 URL 加载**：
   - 点击"从 URL 加载"
   - 输入模型 URL
   - 推荐使用 [Ready Player Me](https://readyplayer.me) 生成的 GLB 链接

推荐资源：
- **Ready Player Me**: https://readyplayer.me （免费创建自定义角色）
- **Sketchfab**: https://sketchfab.com （大量免费 3D 模型）

## 🐛 常见问题

### 1. 前端报错：网络请求失败

**原因**：后端未启动或地址不正确

**解决**：
```bash
# 确认后端正在运行
curl http://localhost:3001/health

# 如果没有响应，启动后端
cd server
npm run dev
```

### 2. MongoDB 连接失败

**原因**：MongoDB 未启动

**解决**：
```bash
# 使用 Docker
docker start mongodb

# 或检查本地 MongoDB 状态
mongosh --eval "db.adminCommand('ping')"
```

### 3. AI 回复错误：Invalid API key

**原因**：OpenAI API Key 未配置或无效

**解决**：
1. 在前端设置中输入有效的 API Key，或
2. 在 `server/.env` 中设置 `DEFAULT_OPENAI_KEY`
3. 确认 API Key 格式：`sk-proj-...` 或 `sk-...`
4. 检查 OpenAI 账户余额

### 4. 3D 模型加载失败

**原因**：模型文件损坏或格式不支持

**解决**：
1. 确认文件格式：GLB, GLTF, FBX, OBJ
2. 尝试在 [Three.js Editor](https://threejs.org/editor/) 中打开模型
3. 使用 Ready Player Me 生成的模型（兼容性最好）

### 5. 端口被占用

**错误**：`EADDRINUSE: address already in use :::3001`

**解决**：
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

## 📊 性能优化建议

### 前端优化

1. **减少 3D 模型大小**：
   - 使用压缩的 GLB 格式
   - 降低纹理分辨率
   - 使用 Draco 压缩

2. **优化渲染**：
   - 减少场景中的光源数量
   - 使用较低的抗锯齿设置

### 后端优化

1. **MongoDB 索引**：
   ```javascript
   // 已在模型中自动创建
   ```

2. **API 缓存**：
   - 考虑使用 Redis 缓存频繁查询

3. **日志管理**：
   - 生产环境使用 Winston 或 Bunyan

## 🚀 部署到生产环境

### 前端部署

```bash
npm run build
```

生成的文件在 `dist/` 目录，可以部署到：
- Vercel
- Netlify
- GitHub Pages
- 任何静态托管服务

### 后端部署

```bash
cd server
npm run build
npm start
```

推荐部署到：
- Heroku
- Railway
- DigitalOcean
- AWS/Azure/GCP

**环境变量**：
确保在生产环境设置所有必要的环境变量。

## 📚 更多资源

- [README.md](README.md) - 项目概述
- [模型导入指南](docs/MODEL_IMPORT_GUIDE.md)
- [3D 角色创建指南](docs/CREATE_3D_CHARACTER_GUIDE.md)
- [后端 API 文档](server/README.md)

## 💡 开发技巧

### 热重载

- 前端：Vite 自动热重载
- 后端：使用 `tsx watch` 自动重启

### 调试

**前端调试**：
```javascript
// 在浏览器控制台
console.log('Debug:', window.THREE);
```

**后端调试**：
```bash
# 启用详细日志
NODE_ENV=development npm run dev
```

### 数据库管理

```bash
# 连接到 MongoDB
mongosh mongodb://localhost:27017/3d-ai-pet

# 查看数据
use 3d-ai-pet
db.users.find()
db.conversations.find()
db.memories.find()

# 清空数据（谨慎！）
db.users.deleteMany({})
```

## 🤝 获取帮助

遇到问题？

1. 查看 [Issues](https://github.com/ghlonghan007/aichatbot/issues)
2. 提交新的 Issue
3. 加入讨论

---

祝你使用愉快！🎉

