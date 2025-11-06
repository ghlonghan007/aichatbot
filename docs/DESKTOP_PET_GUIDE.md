# 桌面宠物实现指南

本指南说明如何将你的 3D AI 助手转换为桌面宠物应用。

## 🎯 方案对比

### 方案一：Electron + 现有技术栈（推荐）⭐⭐⭐⭐⭐

**技术栈：** Electron + React + Three.js + TypeScript

**优点：**
- ✅ 保留 100% 现有代码
- ✅ 透明窗口、始终置顶
- ✅ 可穿透点击（点击桌面穿过宠物）
- ✅ 系统托盘、开机启动
- ✅ 跨平台支持
- ✅ 可以打包成独立应用

**缺点：**
- ❌ 包体积较大（~150-200MB）
- ❌ 内存占用较高（~200-300MB）

**适合场景：** 需要完整功能、跨平台、易于开发

---

### 方案二：Tauri + 现有技术栈（轻量级）⭐⭐⭐⭐

**技术栈：** Tauri + React + Three.js + TypeScript

**优点：**
- ✅ 保留现有代码
- ✅ 超小包体积（~10-20MB）
- ✅ 低内存占用（~50-100MB）
- ✅ 更安全（Rust 后端）
- ✅ 所有 Electron 的桌面功能

**缺点：**
- ❌ 需要安装 Rust 环境
- ❌ 生态相对较小

**适合场景：** 追求性能和体积优化

---

### 方案三：原生 + WebView（最轻量）⭐⭐⭐

**技术栈：** C#/Python + WebView2 + 现有前端

**优点：**
- ✅ 极小包体积（~5-10MB）
- ✅ 极低内存占用
- ✅ 原生性能

**缺点：**
- ❌ 需要学习原生开发
- ❌ 跨平台支持复杂

**适合场景：** 单平台、追求极致性能

---

## 🚀 快速开始：Electron 方案

### 1. 安装 Electron

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

### 2. 创建 Electron 主进程

创建 `electron/main.js`:

```javascript
const { app, BrowserWindow, Tray, Menu, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    frame: false,              // 无边框
    transparent: true,         // 透明窗口
    alwaysOnTop: true,        // 始终置顶
    skipTaskbar: true,        // 不显示在任务栏
    resizable: false,
    x: width - 450,           // 默认位置：右下角
    y: height - 550,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 开发模式
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口拖拽
  setupWindowDragging();
  
  // 创建托盘
  createTray();
}

function setupWindowDragging() {
  mainWindow.on('will-move', (event, bounds) => {
    // 记录鼠标位置用于拖拽
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../assets/icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '显示/隐藏', 
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    { 
      label: '设置透明度',
      submenu: [
        { label: '100%', click: () => mainWindow.setOpacity(1.0) },
        { label: '80%', click: () => mainWindow.setOpacity(0.8) },
        { label: '60%', click: () => mainWindow.setOpacity(0.6) },
      ]
    },
    { 
      label: '穿透点击',
      type: 'checkbox',
      checked: false,
      click: (menuItem) => {
        mainWindow.setIgnoreMouseEvents(menuItem.checked, { forward: true });
      }
    },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('3D AI 桌面宠物');
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### 3. 创建预加载脚本

创建 `electron/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // 窗口控制
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  
  // 获取鼠标位置
  getMousePosition: () => ipcRenderer.invoke('get-mouse-position'),
  
  // 设置窗口位置
  setWindowPosition: (x, y) => ipcRenderer.send('set-window-position', { x, y }),
});
```

### 4. 更新 package.json

```json
{
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.yourcompany.3d-ai-pet",
    "productName": "3D AI 桌面宠物",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "assets/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    }
  }
}
```

### 5. 更新前端代码以支持桌面拖拽

创建 `src/components/WindowDragArea.tsx`:

```typescript
import { useEffect, useRef } from 'react';

export default function WindowDragArea({ children }: { children: React.ReactNode }) {
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const area = dragAreaRef.current;
    if (!area) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      offset.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - offset.current.x;
      const deltaY = e.clientY - offset.current.y;
      
      // 通过 Electron IPC 移动窗口
      if (window.electron) {
        const newX = window.screenX + deltaX;
        const newY = window.screenY + deltaY;
        window.electron.setWindowPosition(newX, newY);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    area.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      area.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={dragAreaRef}
      style={{ cursor: 'move', userSelect: 'none' }}
    >
      {children}
    </div>
  );
}
```

### 6. 运行和打包

```bash
# 开发模式
npm run electron:dev

# 打包
npm run electron:build
```

---

## 🎨 桌面宠物特性实现

### 1. 透明背景

在 `index.html` 添加：

```html
<style>
  body {
    background: transparent !important;
    -webkit-app-region: drag; /* 允许拖拽 */
  }
  
  #root {
    background: transparent !important;
  }
  
  /* 3D 画布背景透明 */
  canvas {
    background: transparent !important;
  }
</style>
```

在 `Avatar3D.tsx` 中：

```typescript
scene.background = null; // 透明背景而不是白色
```

### 2. 角色交互

```typescript
// 点击角色时的反应
<div 
  onClick={() => {
    // 播放一个随机反应
    const reactions = ['wave', 'smile', 'surprised'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    playReaction(reaction);
  }}
  onMouseEnter={() => {
    // 眼睛看向鼠标
    lookAtMouse();
  }}
>
  <Avatar3D ... />
</div>
```

### 3. 鼠标跟随眼睛

```typescript
function lookAtMouse() {
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = -(e.clientY - rect.top - rect.height / 2) / rect.height;
    
    if (currentModelRef.current) {
      lookAt(currentModelRef.current, x, y);
    }
  });
}
```

### 4. 自动行为

```typescript
// 随机做一些动作
setInterval(() => {
  const behaviors = [
    () => blinkEyes(model),
    () => smile(model, 0.5),
    () => lookAt(model, Math.random() * 2 - 1, Math.random() * 2 - 1),
  ];
  
  const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
  behavior();
}, 5000);
```

---

## 📊 性能优化

### 1. 降低帧率（桌面宠物不需要 60fps）

```typescript
// 在 Avatar3D.tsx 中
let lastTime = 0;
const targetFPS = 30;
const frameInterval = 1000 / targetFPS;

const animate = (currentTime: number) => {
  requestAnimationFrame(animate);
  
  const deltaTime = currentTime - lastTime;
  if (deltaTime < frameInterval) return;
  
  lastTime = currentTime - (deltaTime % frameInterval);
  
  // 渲染逻辑...
  renderer.render(scene, camera);
};
```

### 2. 降低模型质量

```typescript
// 使用低质量的 Ready Player Me 模型
const modelUrl = 'https://avatars.readyplayer.me/[ID].glb?textureQuality=low&meshLOD=0';
```

---

## 🎁 额外功能建议

### 1. 语音唤醒
```typescript
// 使用 Web Speech API
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  if (transcript.includes('嘿，助手')) {
    // 唤醒动画和反应
  }
};
```

### 2. 定时提醒
```typescript
// 每小时提醒休息
setInterval(() => {
  showNotification('该休息一下了！');
  surprised(model, 0.8);
  speak('主人，你已经工作一小时了，休息一下吧！');
}, 60 * 60 * 1000);
```

### 3. 天气显示
```typescript
// 根据天气改变表情和服装
const weather = await fetchWeather();
if (weather === 'rain') {
  // 显示雨伞、穿雨衣
}
```

---

## 🚀 快速开始命令

```bash
# 1. 安装 Electron 依赖
npm install --save-dev electron electron-builder concurrently wait-on

# 2. 创建必要的文件（见上面的代码）

# 3. 运行开发模式
npm run electron:dev

# 4. 打包发布
npm run electron:build
```

---

## 📦 包体积对比

| 方案 | 安装包大小 | 运行内存 | 启动速度 |
|------|-----------|---------|---------|
| Electron | 150-200MB | 200-300MB | 2-3秒 |
| Tauri | 10-20MB | 50-100MB | 1-2秒 |
| 原生 | 5-10MB | 30-50MB | <1秒 |

---

## ❓ 常见问题

**Q: 会影响系统性能吗？**
A: 正常情况下 CPU 使用率 < 5%，内存 < 300MB

**Q: 可以同时有多个宠物吗？**
A: 可以，只需要创建多个窗口实例

**Q: 可以换皮肤吗？**
A: 可以，加载不同的 GLB 模型即可

**Q: 可以联网和 AI 对话吗？**
A: 可以，集成 OpenAI API 或其它服务

---

## 🎯 推荐实现顺序

1. ✅ 先完成 Electron 基础框架（1天）
2. ✅ 实现透明窗口和拖拽（0.5天）
3. ✅ 集成现有 3D 代码（0.5天）
4. ✅ 添加交互功能（1-2天）
5. ✅ 优化性能和打包（1天）

**总计：3-5 天即可完成基础版本**

---

需要我帮你创建完整的 Electron 项目结构吗？

