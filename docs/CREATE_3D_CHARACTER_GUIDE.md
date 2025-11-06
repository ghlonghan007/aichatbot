# 如何制作 Three.js 3D 角色完整指南

本指南将教你如何从零开始创建适合 Three.js 使用的 3D 角色，包含多种方法和工具。

## 目录

1. [快速方法：使用在线工具](#快速方法使用在线工具)
2. [进阶方法：使用 Blender](#进阶方法使用-blender)
3. [使用代码创建程序化角色](#使用代码创建程序化角色)
4. [AI 生成 3D 模型](#ai-生成-3d-模型)
5. [最佳实践和优化](#最佳实践和优化)

---

## 快速方法：使用在线工具

### 1. Ready Player Me（推荐 ⭐⭐⭐⭐⭐）

**最简单的方法，5 分钟搞定！**

#### 步骤：

1. **访问网站**
   - 打开 [https://readyplayer.me/](https://readyplayer.me/)
   - 完全免费，无需注册

2. **创建角色**
   - 点击 "Create Avatar"
   - 选择风格：半身像或全身
   - 上传自拍照（可选，AI 会自动生成相似脸型）

3. **自定义外观**
   - 脸型、发型、眼睛、鼻子、嘴巴
   - 皮肤颜色、服装、配饰
   - 可调整数百个参数

4. **导出模型**
   - 点击右上角的导出按钮
   - 选择 GLB 格式
   - 下载到本地

5. **在项目中使用**
   - 直接上传到我们的应用
   - 或者复制模型 URL：`https://models.readyplayer.me/[ID].glb`

**优点：**
- ✅ 完全免费
- ✅ 质量高，带绑定和面部表情
- ✅ 可商用
- ✅ 即开即用，无需 3D 软件经验

---

### 2. VRoid Studio

**适合制作动漫风格角色**

#### 步骤：

1. **下载软件**
   - 访问 [https://vroid.com/studio](https://vroid.com/studio)
   - Windows/Mac 免费下载

2. **创建角色**
   - 打开 VRoid Studio
   - 选择"新建角色"
   - 使用画笔工具绘制头发、服装

3. **自定义**
   - 脸部编辑器：眼睛、鼻子、嘴巴
   - 发型编辑器：笔刷绘制头发
   - 服装编辑器：纹理绘制

4. **导出**
   - File → Export → VRM 格式
   - 可以转换为 GLB（需要额外工具）

**优点：**
- ✅ 免费
- ✅ 动漫风格精美
- ✅ 详细的自定义选项

---

### 3. Avaturn

**AI 驱动的逼真头像生成**

1. 访问 [https://avaturn.me/](https://avaturn.me/)
2. 上传自拍照
3. AI 自动生成 3D 头像
4. 微调后导出 GLB

---

## 进阶方法：使用 Blender

### Blender 完整教程（从零开始）

**Blender 是免费开源的专业 3D 软件**

#### 安装 Blender

1. 访问 [https://www.blender.org/](https://www.blender.org/)
2. 下载最新版本（3.6+ 推荐）
3. 安装并打开

---

### 方法 A：简单几何体组合（初学者）

**创建类似我们项目内置的简单角色**

```
打开 Blender → 删除默认立方体 → 开始创建
```

#### 1. 创建头部

```
1. Shift + A → Mesh → UV Sphere
2. 缩放：S 键，调整大小
3. 移动：G 键，然后 Z 键（限制在 Z 轴）
```

#### 2. 创建身体

```
1. Shift + A → Mesh → Cylinder
2. S 键缩放，然后 Z 键拉伸
3. 放置在头部下方
```

#### 3. 创建眼睛

```
1. Shift + A → Mesh → UV Sphere
2. 缩小：S 键 + 0.1
3. 移动到脸部位置
4. Shift + D 复制另一只眼睛
```

#### 4. 创建嘴巴

```
1. Shift + A → Mesh → Cube
2. S 键 + X 键：在 X 轴拉伸
3. S 键 + Y 键：在 Y 轴压扁
4. 放置在脸部下方
```

#### 5. 添加材质和颜色

```
1. 选择对象
2. 右侧面板 → Material Properties
3. 点击 "New"
4. Base Color → 选择颜色
```

#### 6. 导出为 GLB

```
1. File → Export → glTF 2.0 (.glb/.gltf)
2. 选择 GLB Binary 格式
3. 勾选：
   - Include → Selected Objects（如果只导出选中的）
   - Transform → +Y Up
4. Export glTF 2.0
```

---

### 方法 B：使用插件快速创建角色

#### MB-Lab 插件（逼真人类角色）

1. **安装插件**
   ```
   Edit → Preferences → Add-ons → Install
   下载：https://github.com/animate1978/MB-Lab
   ```

2. **创建角色**
   ```
   N 键打开侧边栏 → MB-Lab 标签
   点击 "Create Character"
   选择性别、年龄、种族
   ```

3. **自定义**
   - 使用滑块调整面部特征
   - 调整身体比例
   - 选择皮肤纹理

4. **导出**
   - 按上面的 GLB 导出步骤

---

### 方法 C：雕刻创建（高级）

#### 1. 启用雕刻模式

```
1. 添加 UV Sphere
2. 顶部切换到 "Sculpting" 工作空间
3. 使用雕刻工具：
   - Draw：绘制凸起
   - Grab：拉伸移动
   - Smooth：平滑表面
   - Crease：创建折痕
```

#### 2. 雕刻头部

```
1. 使用 Grab 工具拉出鼻子、下巴
2. 使用 Draw 工具添加眉骨、颧骨
3. 使用 Crease 创建眼窝、嘴部
```

#### 3. 细化

```
1. 右键 → Subdivide（增加细分）
2. 使用更小的笔刷添加细节
3. Smooth 工具平滑表面
```

---

## 使用代码创建程序化角色

**直接在 Three.js 中用代码创建角色**

我来为你创建一个代码生成器组件：

### 程序化角色生成器

这个工具可以让你通过调整参数来生成不同的角色：

```typescript
// 示例：创建程序化角色
function createProceduralCharacter(options: {
  headSize: number;
  eyeSize: number;
  mouthWidth: number;
  skinColor: string;
  eyeColor: string;
}) {
  const group = new THREE.Group();
  
  // 头部
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(options.headSize, 32, 32),
    new THREE.MeshStandardMaterial({ color: options.skinColor })
  );
  
  // 眼睛
  const eyeGeom = new THREE.SphereGeometry(options.eyeSize, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({ color: options.eyeColor });
  
  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.2, 0.1, 0.5);
  
  const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(0.2, 0.1, 0.5);
  
  group.add(head, leftEye, rightEye);
  return group;
}
```

---

## AI 生成 3D 模型

### 1. Meshy.ai（文字转 3D）

**使用 AI 从文字描述生成 3D 模型**

1. 访问 [https://www.meshy.ai/](https://www.meshy.ai/)
2. 输入提示词（英文）：
   ```
   "cute anime character with big eyes and pink hair"
   "robot assistant with friendly face"
   "professional business person avatar"
   ```
3. AI 生成 3D 模型（2-3 分钟）
4. 下载 GLB 格式

**费用：** 免费额度有限，付费计划 $16/月

---

### 2. Luma AI Genie

1. 访问 [https://lumalabs.ai/genie](https://lumalabs.ai/genie)
2. 输入描述
3. 生成 3D 模型
4. 导出为 GLB

---

### 3. Rodin AI

1. 访问 [https://hyperhuman.deemos.com/rodin](https://hyperhuman.deemos.com/rodin)
2. 上传图片或输入文字
3. 生成高质量 3D 模型

---

## 最佳实践和优化

### 1. 模型规格建议

```
✅ 多边形数：5,000 - 50,000 三角面
✅ 纹理分辨率：1024x1024 或 2048x2048
✅ 文件大小：< 10MB
✅ 格式：GLB（推荐）
```

### 2. 命名规范

在 Blender 中正确命名网格：

```
Head - 头部主体
Eyes - 眼睛组
Eye_L - 左眼
Eye_R - 右眼
Mouth - 嘴巴
Jaw - 下颚
Body - 身体
```

这样我们的系统能自动识别用于动画。

### 3. 优化步骤

#### 在 Blender 中：

1. **简化多边形**
   ```
   选择模型 → 右侧修改器 → Add Modifier → Decimate
   调整 Ratio 到 0.5（减少 50% 面数）
   ```

2. **合并材质**
   ```
   选择所有对象 → Ctrl + J 合并
   Material Properties → 减少材质数量
   ```

3. **烘焙纹理**
   ```
   Shading 工作空间
   添加 Image Texture 节点
   Render → Bake
   ```

### 4. 导出设置（重要！）

**Blender GLB 导出清单：**

```
☑️ Format: glTF Binary (.glb)
☑️ Include: 
   ☑️ Selected Objects / Visible Objects
☑️ Transform:
   ☑️ +Y Up
☑️ Geometry:
   ☑️ Apply Modifiers
   ☑️ UVs
   ☑️ Normals
   ☑️ Vertex Colors
☑️ Materials:
   ☑️ Materials
☑️ Compression:
   ☑️ Compress (Draco)
```

---

## 快速对比表

| 方法 | 难度 | 时间 | 质量 | 费用 | 适用场景 |
|------|------|------|------|------|----------|
| Ready Player Me | ⭐ | 5分钟 | ⭐⭐⭐⭐ | 免费 | 快速原型、通用角色 |
| VRoid Studio | ⭐⭐ | 30分钟 | ⭐⭐⭐⭐ | 免费 | 动漫风格 |
| Blender 几何体 | ⭐⭐ | 1小时 | ⭐⭐⭐ | 免费 | 简单风格、学习 |
| Blender 雕刻 | ⭐⭐⭐⭐ | 数小时 | ⭐⭐⭐⭐⭐ | 免费 | 专业项目 |
| AI 生成 | ⭐ | 5分钟 | ⭐⭐⭐ | 部分免费 | 快速测试、创意 |
| 程序化代码 | ⭐⭐⭐ | 30分钟 | ⭐⭐ | 免费 | 动态生成、游戏 |

---

## 推荐学习路径

### 新手（第 1 周）
1. 先用 Ready Player Me 创建第一个角色
2. 下载并在项目中测试
3. 了解 GLB 格式的基础

### 初级（第 2-4 周）
1. 下载 Blender
2. 学习基础操作（移动、旋转、缩放）
3. 用几何体创建简单角色
4. 学习材质和颜色

### 中级（1-3 个月）
1. 学习雕刻基础
2. 了解拓扑和重拓扑
3. 学习 UV 展开和纹理绘制
4. 研究绑定（Rigging）

### 高级（3+ 个月）
1. 角色动画
2. 面部表情系统
3. 程序化生成
4. 性能优化

---

## 推荐教程资源

### 视频教程（中文）
- Bilibili：搜索 "Blender 角色建模教程"
- YouTube：Blender Guru（英文，有字幕）

### 文档
- Blender 官方手册：[https://docs.blender.org/](https://docs.blender.org/)
- Three.js 文档：[https://threejs.org/docs/](https://threejs.org/docs/)

### 社区
- Blender Artists：[https://blenderartists.org/](https://blenderartists.org/)
- Three.js Discourse：[https://discourse.threejs.org/](https://discourse.threejs.org/)

---

## 常见问题

**Q: 我完全没有 3D 经验，应该从哪里开始？**
A: 先用 Ready Player Me 创建角色，然后再学 Blender。

**Q: 模型导入后颜色不对？**
A: 确保导出时勾选了 Materials，并且使用 GLB 格式。

**Q: 模型太大导致加载慢？**
A: 使用 Draco 压缩，或在 Blender 中减少多边形数。

**Q: 如何让嘴巴动起来？**
A: 确保嘴部是独立的网格，并命名为 "Mouth" 或 "Jaw"。

**Q: 可以用 AI 生成动画吗？**
A: 可以使用 Mixamo 自动绑定和添加动画。

---

## 下一步

创建好角色后：
1. 导出为 GLB 格式
2. 在我们的应用中上传测试
3. 根据效果调整模型
4. 添加更多细节和优化

祝你创作愉快！🎨✨

