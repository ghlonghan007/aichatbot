# 3D 模型导入指南

本项目支持导入外部 3D 模型，让你的 AI 助手拥有独特的外观！

## 支持的格式

- **GLB** (推荐) - 二进制 GLTF，单文件包含所有资源
- **GLTF** - JSON 格式的 GLTF，可能需要额外的纹理文件
- **FBX** - Autodesk FBX 格式
- **OBJ** - Wavefront OBJ 格式

## 如何使用

### 方法 1: 上传本地文件

1. 点击"📁 上传模型文件"按钮
2. 选择你的 3D 模型文件（.glb, .gltf, .fbx, .obj）
3. 等待加载完成
4. 模型会自动显示在画布上

### 方法 2: 从 URL 加载

1. 点击"🌐 从 URL 加载"按钮
2. 输入模型的完整 URL（例如：`https://example.com/model.glb`）
3. 确认后等待加载
4. 模型会自动显示

## 免费 3D 模型资源

以下是一些可以下载免费 3D 模型的网站：

### 推荐网站

1. **[Sketchfab](https://sketchfab.com/)** - 海量免费 3D 模型，支持 GLB 下载
   - 搜索时勾选"Downloadable"
   - 选择"Creative Commons"许可证

2. **[Ready Player Me](https://readyplayer.me/)** - 创建自定义头像
   - 完全免费
   - 直接导出 GLB 格式
   - 非常适合 AI 助手

3. **[Mixamo](https://www.mixamo.com/)** - Adobe 的免费角色和动画
   - 下载为 FBX 或 GLB
   - 包含丰富的动画

4. **[Poly Pizza](https://poly.pizza/)** - 低多边形风格模型
   - 全部免费使用
   - GLB 格式

5. **[CGTrader Free Models](https://www.cgtrader.com/free-3d-models)** - 免费区域
   - 各种格式
   - 需要注册账号

### 示例模型 URL

你可以尝试以下免费可用的模型 URL：

```
https://models.readyplayer.me/[你的角色ID].glb
```

## 模型要求

- **文件大小**: 建议小于 10MB 以获得最佳性能
- **多边形数**: 建议 5K-50K 三角面，太复杂会影响性能
- **纹理**: 如果使用纹理，确保打包在 GLB 中或纹理文件与模型在同一目录

## 自动调整

导入的模型会自动：
- ✅ 居中到场景中心
- ✅ 缩放到合适大小（高度约 2 单位）
- ✅ 应用基本光照

## 动画支持

如果你的模型包含动画（如嘴部、眼睛动画），系统会尝试：
- 查找名为 "head"、"face" 的部分用于头部动画
- 查找名为 "mouth"、"jaw" 的部分用于说话动画

### 命名建议

为了获得最佳效果，在 Blender 或其他 3D 软件中：
- 将头部网格命名为 `Head` 或 `Face`
- 将嘴部/下颚命名为 `Mouth` 或 `Jaw`
- 将眼睛命名为 `Eyes` 或 `Eye_L`、`Eye_R`

## 故障排除

### 模型加载失败
- 检查文件格式是否正确
- 确保文件未损坏
- 如果是 GLTF，确保所有引用的文件都存在

### 模型显示异常
- 模型可能太大或太小 - 系统会自动缩放，但可能需要调整
- 材质可能不兼容 - 尝试使用 GLB 格式

### 性能问题
- 模型多边形数太高 - 在 Blender 中简化模型
- 纹理分辨率太高 - 降低到 1024x1024 或更小

## 使用 Blender 优化模型

1. 打开 Blender，导入你的模型
2. 选择模型 → Mesh → Clean Up → Decimate Geometry
3. File → Export → glTF 2.0 (.glb)
4. 在导出设置中：
   - Format: GLB
   - Include: Selected Objects
   - Transform: +Y Up
   - Compression: 勾选

## 技术细节

模型加载使用 Three.js 的标准加载器：
- `GLTFLoader` - GLTF/GLB 文件（支持 Draco 压缩）
- `DRACOLoader` - 解码 Draco 压缩的几何体
- `FBXLoader` - FBX 文件
- `OBJLoader` - OBJ 文件

### Draco 压缩支持

系统已配置 Draco 解码器，可以加载压缩的 GLB 模型：
- ✅ 自动检测并解码 Draco 压缩
- ✅ 使用 Google CDN 上的解码器
- ✅ 大幅减小文件大小（通常减少 70-90%）
- ✅ Ready Player Me 模型完全支持

加载器会：
1. 检测是否使用了 Draco 压缩
2. 自动下载解码器（首次使用时）
3. 解压缩几何体数据
4. 创建材质和纹理
5. 构建场景图
6. 应用变换和动画

## 示例代码

如果你想在代码中加载模型：

```typescript
import { loadModel } from './lib/modelLoader';

// 从文件加载
const model = await loadModel(file);

// 从 URL 加载
const model = await loadModel('https://example.com/model.glb');

// 添加到场景
scene.add(model);
```

## 版权和许可

- 确保你有权使用导入的模型
- 商业使用前检查许可证
- 建议使用 CC0 或 CC-BY 许可的模型

