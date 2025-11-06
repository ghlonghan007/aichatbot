import * as THREE from 'three';

/**
 * Ready Player Me 标准 Morph Targets
 * 参考：https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets
 */
export const MORPH_TARGETS = {
  // 眼睛相关
  eyeBlinkLeft: 'eyeBlinkLeft',
  eyeBlinkRight: 'eyeBlinkRight',
  eyeWideLeft: 'eyeWideLeft',
  eyeWideRight: 'eyeWideRight',
  eyeSquintLeft: 'eyeSquintLeft',
  eyeSquintRight: 'eyeSquintRight',
  eyeLookUpLeft: 'eyeLookUpLeft',
  eyeLookUpRight: 'eyeLookUpRight',
  eyeLookDownLeft: 'eyeLookDownLeft',
  eyeLookDownRight: 'eyeLookDownRight',
  eyeLookInLeft: 'eyeLookInLeft',
  eyeLookInRight: 'eyeLookInRight',
  eyeLookOutLeft: 'eyeLookOutLeft',
  eyeLookOutRight: 'eyeLookOutRight',

  // 嘴巴相关
  mouthOpen: 'mouthOpen',
  mouthSmile: 'mouthSmile',
  mouthFrown: 'mouthFrown',
  mouthPucker: 'mouthPucker',
  mouthFunnel: 'mouthFunnel',
  mouthLeft: 'mouthLeft',
  mouthRight: 'mouthRight',
  mouthRollUpper: 'mouthRollUpper',
  mouthRollLower: 'mouthRollLower',
  mouthShrugUpper: 'mouthShrugUpper',
  mouthShrugLower: 'mouthShrugLower',
  mouthClose: 'mouthClose',
  mouthDimpleLeft: 'mouthDimpleLeft',
  mouthDimpleRight: 'mouthDimpleRight',

  // 眉毛相关
  browInnerUp: 'browInnerUp',
  browOuterUpLeft: 'browOuterUpLeft',
  browOuterUpRight: 'browOuterUpRight',
  browDownLeft: 'browDownLeft',
  browDownRight: 'browDownRight',

  // 脸颊
  cheekPuff: 'cheekPuff',
  cheekSquintLeft: 'cheekSquintLeft',
  cheekSquintRight: 'cheekSquintRight',

  // 下巴/颌
  jawOpen: 'jawOpen',
  jawForward: 'jawForward',
  jawLeft: 'jawLeft',
  jawRight: 'jawRight',

  // 鼻子
  noseSneerLeft: 'noseSneerLeft',
  noseSneerRight: 'noseSneerRight',
};

/**
 * 查找模型中所有包含 Morph Targets 的网格
 */
export function findMorphTargetMeshes(model: THREE.Group): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
      meshes.push(child);
    }
  });
  
  return meshes;
}

/**
 * 设置 Morph Target 的值
 */
export function setMorphTarget(
  model: THREE.Group,
  targetName: string,
  value: number
): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
      const index = child.morphTargetDictionary[targetName];
      if (index !== undefined && child.morphTargetInfluences) {
        child.morphTargetInfluences[index] = THREE.MathUtils.clamp(value, 0, 1);
      }
    }
  });
}

/**
 * 获取 Morph Target 的当前值
 */
export function getMorphTarget(
  model: THREE.Group,
  targetName: string
): number {
  let value = 0;
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
      const index = child.morphTargetDictionary[targetName];
      if (index !== undefined && child.morphTargetInfluences) {
        value = child.morphTargetInfluences[index] || 0;
      }
    }
  });
  return value;
}

/**
 * 重置所有 Morph Targets
 */
export function resetAllMorphTargets(model: THREE.Group): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
      child.morphTargetInfluences.fill(0);
    }
  });
}

/**
 * 获取模型支持的所有 Morph Target 名称
 */
export function getAvailableMorphTargets(model: THREE.Group): string[] {
  const targets = new Set<string>();
  
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
      Object.keys(child.morphTargetDictionary).forEach(name => {
        targets.add(name);
      });
    }
  });
  
  return Array.from(targets);
}

/**
 * 眨眼动画
 */
export function blinkEyes(model: THREE.Group, duration: number = 0.15): void {
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = elapsed / duration;
    
    if (progress < 1) {
      // 使用正弦曲线实现平滑的眨眼
      const blinkValue = Math.sin(progress * Math.PI);
      setMorphTarget(model, MORPH_TARGETS.eyeBlinkLeft, blinkValue);
      setMorphTarget(model, MORPH_TARGETS.eyeBlinkRight, blinkValue);
      requestAnimationFrame(animate);
    } else {
      setMorphTarget(model, MORPH_TARGETS.eyeBlinkLeft, 0);
      setMorphTarget(model, MORPH_TARGETS.eyeBlinkRight, 0);
    }
  };
  
  animate();
}

/**
 * 嘴巴说话动画（简单版）
 */
export function animateMouthSpeaking(
  model: THREE.Group,
  intensity: number = 0.5
): void {
  const time = Date.now() / 1000;
  const mouthValue = Math.abs(Math.sin(time * 10)) * intensity;
  setMorphTarget(model, MORPH_TARGETS.mouthOpen, mouthValue);
  setMorphTarget(model, MORPH_TARGETS.jawOpen, mouthValue * 0.5);
}

/**
 * 微笑表情
 */
export function smile(model: THREE.Group, intensity: number = 0.7): void {
  setMorphTarget(model, MORPH_TARGETS.mouthSmile, intensity);
}

/**
 * 皱眉表情
 */
export function frown(model: THREE.Group, intensity: number = 0.7): void {
  setMorphTarget(model, MORPH_TARGETS.mouthFrown, intensity);
  setMorphTarget(model, MORPH_TARGETS.browDownLeft, intensity * 0.5);
  setMorphTarget(model, MORPH_TARGETS.browDownRight, intensity * 0.5);
}

/**
 * 惊讶表情
 */
export function surprised(model: THREE.Group, intensity: number = 0.8): void {
  setMorphTarget(model, MORPH_TARGETS.eyeWideLeft, intensity);
  setMorphTarget(model, MORPH_TARGETS.eyeWideRight, intensity);
  setMorphTarget(model, MORPH_TARGETS.mouthOpen, intensity * 0.6);
  setMorphTarget(model, MORPH_TARGETS.browInnerUp, intensity);
  setMorphTarget(model, MORPH_TARGETS.browOuterUpLeft, intensity);
  setMorphTarget(model, MORPH_TARGETS.browOuterUpRight, intensity);
}

/**
 * 眼睛看向某个位置（相对于头部）
 */
export function lookAt(
  model: THREE.Group,
  x: number, // -1 到 1，负数向左，正数向右
  y: number  // -1 到 1，负数向下，正数向上
): void {
  // 水平方向
  if (x < 0) {
    setMorphTarget(model, MORPH_TARGETS.eyeLookInLeft, Math.abs(x));
    setMorphTarget(model, MORPH_TARGETS.eyeLookOutRight, Math.abs(x));
    setMorphTarget(model, MORPH_TARGETS.eyeLookInRight, 0);
    setMorphTarget(model, MORPH_TARGETS.eyeLookOutLeft, 0);
  } else {
    setMorphTarget(model, MORPH_TARGETS.eyeLookOutLeft, x);
    setMorphTarget(model, MORPH_TARGETS.eyeLookInRight, x);
    setMorphTarget(model, MORPH_TARGETS.eyeLookInLeft, 0);
    setMorphTarget(model, MORPH_TARGETS.eyeLookOutRight, 0);
  }
  
  // 垂直方向
  if (y > 0) {
    setMorphTarget(model, MORPH_TARGETS.eyeLookUpLeft, y);
    setMorphTarget(model, MORPH_TARGETS.eyeLookUpRight, y);
    setMorphTarget(model, MORPH_TARGETS.eyeLookDownLeft, 0);
    setMorphTarget(model, MORPH_TARGETS.eyeLookDownRight, 0);
  } else {
    setMorphTarget(model, MORPH_TARGETS.eyeLookDownLeft, Math.abs(y));
    setMorphTarget(model, MORPH_TARGETS.eyeLookDownRight, Math.abs(y));
    setMorphTarget(model, MORPH_TARGETS.eyeLookUpLeft, 0);
    setMorphTarget(model, MORPH_TARGETS.eyeLookUpRight, 0);
  }
}

