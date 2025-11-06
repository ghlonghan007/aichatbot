# Morph Targets 对接指南

本指南说明如何使用 Ready Player Me 模型的 Morph Targets（变形目标）实现眼睛和嘴巴动画。

## 什么是 Morph Targets？

Morph Targets（也称为 Blend Shapes 或 Shape Keys）是 3D 动画中的一种技术，允许你通过混合不同的顶点位置来创建表情和动画。

### Ready Player Me 支持的 Morph Targets

你的模型支持以下 Morph Targets（打开浏览器控制台可以看到完整列表）：

#### 眼睛相关
- `eyeBlinkLeft` / `eyeBlinkRight` - 眨眼
- `eyeWideLeft` / `eyeWideRight` - 睁大眼睛
- `eyeSquintLeft` / `eyeSquintRight` - 眯眼
- `eyeLookUpLeft` / `eyeLookUpRight` - 向上看
- `eyeLookDownLeft` / `eyeLookDownRight` - 向下看
- `eyeLookInLeft` / `eyeLookInRight` - 向内看（交叉眼）
- `eyeLookOutLeft` / `eyeLookOutRight` - 向外看

#### 嘴巴相关
- `mouthOpen` - 张嘴
- `jawOpen` - 下颌张开
- `mouthSmile` - 微笑
- `mouthFrown` - 皱眉
- `mouthPucker` - 嘟嘴
- `mouthFunnel` - 嘴巴呈漏斗状
- `mouthLeft` / `mouthRight` - 嘴巴向左/右
- `mouthDimpleLeft` / `mouthDimpleRight` - 酒窝

#### 眉毛相关
- `browInnerUp` - 内眉上扬
- `browOuterUpLeft` / `browOuterUpRight` - 外眉上扬
- `browDownLeft` / `browDownRight` - 眉毛下压

## 已实现的功能

### 1. 自动嘴型同步

当你点击"播放 TTS"时，模型会自动：
- ✅ 张嘴说话（`mouthOpen` + `jawOpen`）
- ✅ 随语音节奏变化
- ✅ 平滑过渡

```typescript
// 代码示例
if (speaking) {
  animateMouthSpeaking(model, 0.7);
} else {
  setMorphTarget(model, MORPH_TARGETS.mouthOpen, 0);
}
```

### 2. 自动眨眼

模型每 3-5 秒会自动眨眼一次：
- ✅ 自然的眨眼频率
- ✅ 平滑的动画曲线
- ✅ 双眼同步

```typescript
blinkEyes(model); // 触发一次眨眼
```

### 3. 监听时表情

当开启麦克风并检测到说话时：
- ✅ 微微微笑（`mouthSmile`）
- ✅ 眼睛微微睁大（`eyeWideLeft/Right`）
- ✅ 显示专注状态

## 如何使用

### 基础用法

```typescript
import { setMorphTarget, MORPH_TARGETS } from './lib/morphTargets';

// 设置单个 Morph Target（值范围 0-1）
setMorphTarget(model, MORPH_TARGETS.mouthSmile, 0.7);

// 组合多个 Morph Targets 创建表情
// 惊讶表情
setMorphTarget(model, MORPH_TARGETS.eyeWideLeft, 0.8);
setMorphTarget(model, MORPH_TARGETS.eyeWideRight, 0.8);
setMorphTarget(model, MORPH_TARGETS.mouthOpen, 0.6);
setMorphTarget(model, MORPH_TARGETS.browInnerUp, 0.8);
```

### 预设表情

使用预设的表情函数：

```typescript
import { smile, frown, surprised } from './lib/morphTargets';

// 微笑
smile(model, 0.7);

// 皱眉
frown(model, 0.7);

// 惊讶
surprised(model, 0.8);
```

### 眼睛视线控制

```typescript
import { lookAt } from './lib/morphTargets';

// 眼睛看向左上方
lookAt(model, -0.5, 0.5);

// 眼睛看向右下方
lookAt(model, 0.5, -0.5);

// 眼睛看正前方
lookAt(model, 0, 0);
```

### 唇形同步（高级）

如果需要基于音频的精确唇形同步：

```typescript
import { LipSyncController } from './lib/lipSync';

const lipSync = new LipSyncController(model);

// 从音频元素
const audio = new Audio('speech.mp3');
lipSync.startFromAudio(audio);

// 或从麦克风
await lipSync.startFromMicrophone();

// 停止
lipSync.stop();
```

## 查看模型支持的 Morph Targets

打开浏览器控制台（F12），你会看到类似这样的输出：

```
🎭 模型支持的 Morph Targets: [
  "eyeBlinkLeft",
  "eyeBlinkRight", 
  "mouthOpen",
  "jawOpen",
  "mouthSmile",
  ...
]
```

## 自定义动画

### 示例：创建一个"思考"表情

```typescript
function thinking(model: THREE.Group) {
  setMorphTarget(model, MORPH_TARGETS.eyeLookUpLeft, 0.3);
  setMorphTarget(model, MORPH_TARGETS.eyeLookUpRight, 0.3);
  setMorphTarget(model, MORPH_TARGETS.mouthLeft, 0.2);
  setMorphTarget(model, MORPH_TARGETS.browDownLeft, 0.3);
}
```

### 示例：创建一个动画序列

```typescript
async function animateSequence(model: THREE.Group) {
  // 1. 惊讶
  surprised(model, 0.8);
  await sleep(1000);
  
  // 2. 微笑
  resetAllMorphTargets(model);
  smile(model, 0.7);
  await sleep(1000);
  
  // 3. 恢复正常
  resetAllMorphTargets(model);
}
```

## 性能优化

1. **避免频繁更新** - 在动画循环中更新，不要每帧都设置所有值
2. **使用插值** - 用 `THREE.MathUtils.lerp()` 实现平滑过渡
3. **限制活动目标** - 同时只激活必要的 Morph Targets

```typescript
// 平滑过渡示例
const currentValue = getMorphTarget(model, MORPH_TARGETS.mouthSmile);
const targetValue = 0.7;
const newValue = THREE.MathUtils.lerp(currentValue, targetValue, 0.1);
setMorphTarget(model, MORPH_TARGETS.mouthSmile, newValue);
```

## 故障排除

### 模型没有反应？

1. 检查控制台是否输出了支持的 Morph Targets
2. 确认你的模型是 Ready Player Me 导出的
3. 检查模型导出时是否勾选了 "Basic expressions"

### 动画不平滑？

```typescript
// 使用插值实现平滑过渡
function smoothSetMorph(model: THREE.Group, target: string, value: number, speed: number = 0.1) {
  const current = getMorphTarget(model, target);
  const newValue = THREE.MathUtils.lerp(current, value, speed);
  setMorphTarget(model, target, newValue);
}
```

### 如何重置所有表情？

```typescript
import { resetAllMorphTargets } from './lib/morphTargets';

resetAllMorphTargets(model);
```

## 完整示例

### 创建一个表情切换器

```typescript
import { useEffect } from 'react';
import * as THREE from 'three';
import { smile, frown, surprised, resetAllMorphTargets } from './lib/morphTargets';

function ExpressionDemo({ model }: { model: THREE.Group }) {
  const handleExpression = (type: string) => {
    resetAllMorphTargets(model);
    
    switch (type) {
      case 'happy':
        smile(model, 0.8);
        break;
      case 'sad':
        frown(model, 0.7);
        break;
      case 'surprised':
        surprised(model, 0.9);
        break;
      default:
        resetAllMorphTargets(model);
    }
  };

  return (
    <div>
      <button onClick={() => handleExpression('happy')}>😊 开心</button>
      <button onClick={() => handleExpression('sad')}>😢 难过</button>
      <button onClick={() => handleExpression('surprised')}>😮 惊讶</button>
      <button onClick={() => handleExpression('neutral')}>😐 正常</button>
    </div>
  );
}
```

## 下一步

- 集成真实的语音识别和合成
- 添加更多预设表情
- 实现基于音频分析的精确唇形同步
- 添加情绪检测并自动切换表情

## 参考资源

- [Ready Player Me 文档](https://docs.readyplayer.me/)
- [Three.js Morph Targets](https://threejs.org/docs/#api/en/core/BufferGeometry.morphAttributes)
- [Apple ARKit 表情标准](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation)

