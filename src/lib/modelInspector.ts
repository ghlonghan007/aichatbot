import * as THREE from 'three';

/**
 * 模型检测工具 - 分析模型包含的所有内容
 */
export interface ModelInfo {
  hasSkeleton: boolean;
  boneCount: number;
  boneNames: string[];
  hasMorphTargets: boolean;
  morphTargetCount: number;
  morphTargetNames: string[];
  hasAnimations: boolean;
  animationCount: number;
  animationNames: string[];
  meshCount: number;
  textureCount: number;
  materialCount: number;
  triangleCount: number;
  vertexCount: number;
}

/**
 * 检查模型信息
 */
export function inspectModel(model: THREE.Group): ModelInfo {
  const info: ModelInfo = {
    hasSkeleton: false,
    boneCount: 0,
    boneNames: [],
    hasMorphTargets: false,
    morphTargetCount: 0,
    morphTargetNames: [],
    hasAnimations: false,
    animationCount: 0,
    animationNames: [],
    meshCount: 0,
    textureCount: 0,
    materialCount: 0,
    triangleCount: 0,
    vertexCount: 0,
  };

  const bones = new Set<string>();
  const morphTargets = new Set<string>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  // 遍历模型
  model.traverse((child) => {
    // 检查网格
    if (child instanceof THREE.Mesh) {
      info.meshCount++;

      // 统计顶点和三角形
      if (child.geometry) {
        const positions = child.geometry.attributes.position;
        if (positions) {
          info.vertexCount += positions.count;
        }
        if (child.geometry.index) {
          info.triangleCount += child.geometry.index.count / 3;
        }
      }

      // 检查骨骼
      if (child.skeleton) {
        info.hasSkeleton = true;
        child.skeleton.bones.forEach((bone) => {
          bones.add(bone.name);
        });
      }

      // 检查 Morph Targets
      if (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 0) {
        info.hasMorphTargets = true;
        Object.keys(child.morphTargetDictionary).forEach((name) => {
          morphTargets.add(name);
        });
      }

      // 收集材质
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => materials.add(mat));
      } else if (child.material) {
        materials.add(child.material);
      }
    }

    // 检查骨骼节点
    if (child instanceof THREE.Bone) {
      info.hasSkeleton = true;
      bones.add(child.name);
    }
  });

  // 收集纹理
  materials.forEach((material) => {
    if (material instanceof THREE.MeshStandardMaterial || 
        material instanceof THREE.MeshBasicMaterial ||
        material instanceof THREE.MeshPhongMaterial) {
      const mat = material as any;
      if (mat.map) textures.add(mat.map);
      if (mat.normalMap) textures.add(mat.normalMap);
      if (mat.roughnessMap) textures.add(mat.roughnessMap);
      if (mat.metalnessMap) textures.add(mat.metalnessMap);
      if (mat.emissiveMap) textures.add(mat.emissiveMap);
      if (mat.aoMap) textures.add(mat.aoMap);
    }
  });

  // 检查动画
  if ((model as any).animations && Array.isArray((model as any).animations)) {
    const animations = (model as any).animations as THREE.AnimationClip[];
    info.hasAnimations = animations.length > 0;
    info.animationCount = animations.length;
    info.animationNames = animations.map(clip => clip.name);
  }

  info.boneCount = bones.size;
  info.boneNames = Array.from(bones);
  info.morphTargetCount = morphTargets.size;
  info.morphTargetNames = Array.from(morphTargets);
  info.materialCount = materials.size;
  info.textureCount = textures.size;

  return info;
}

/**
 * 打印模型信息到控制台
 */
export function printModelInfo(model: THREE.Group, modelName: string = '模型'): void {
  const info = inspectModel(model);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ${modelName} 详细信息`);
  console.log(`${'='.repeat(60)}`);

  // 基本信息
  console.log('\n📊 基本统计:');
  console.log(`  • 网格数量: ${info.meshCount}`);
  console.log(`  • 顶点数量: ${info.vertexCount.toLocaleString()}`);
  console.log(`  • 三角形数量: ${Math.floor(info.triangleCount).toLocaleString()}`);
  console.log(`  • 材质数量: ${info.materialCount}`);
  console.log(`  • 纹理数量: ${info.textureCount}`);

  // 骨骼信息
  console.log('\n🦴 骨骼系统:');
  if (info.hasSkeleton) {
    console.log(`  ✅ 包含骨骼: 是`);
    console.log(`  • 骨骼数量: ${info.boneCount}`);
    if (info.boneCount <= 20) {
      console.log(`  • 骨骼列表:`, info.boneNames);
    } else {
      console.log(`  • 主要骨骼 (前10个):`, info.boneNames.slice(0, 10));
      console.log(`    ... 还有 ${info.boneCount - 10} 个骨骼`);
    }
  } else {
    console.log(`  ❌ 包含骨骼: 否`);
  }

  // Morph Targets 信息
  console.log('\n🎭 面部表情 (Morph Targets):');
  if (info.hasMorphTargets) {
    console.log(`  ✅ 包含表情: 是`);
    console.log(`  • 表情数量: ${info.morphTargetCount}`);
    if (info.morphTargetCount <= 20) {
      console.log(`  • 表情列表:`, info.morphTargetNames);
    } else {
      console.log(`  • 主要表情:`, info.morphTargetNames.slice(0, 15));
      console.log(`    ... 还有 ${info.morphTargetCount - 15} 个表情`);
    }
  } else {
    console.log(`  ❌ 包含表情: 否`);
  }

  // 动画信息
  console.log('\n🎬 动画:');
  if (info.hasAnimations) {
    console.log(`  ✅ 包含动画: 是`);
    console.log(`  • 动画数量: ${info.animationCount}`);
    console.log(`  • 动画列表:`, info.animationNames);
  } else {
    console.log(`  ❌ 包含动画: 否`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

/**
 * 获取骨骼层级树
 */
export function getBoneHierarchy(model: THREE.Group): string {
  let output = '\n🦴 骨骼层级结构:\n';
  
  model.traverse((child) => {
    if (child instanceof THREE.Bone) {
      const depth = getDepth(child);
      const indent = '  '.repeat(depth);
      output += `${indent}├─ ${child.name}\n`;
    }
  });

  return output;
}

function getDepth(object: THREE.Object3D): number {
  let depth = 0;
  let current = object.parent;
  while (current) {
    depth++;
    current = current.parent;
  }
  return depth;
}

/**
 * 检查模型是否适合动画
 */
export function isAnimationReady(model: THREE.Group): {
  ready: boolean;
  reasons: string[];
} {
  const info = inspectModel(model);
  const reasons: string[] = [];

  if (!info.hasSkeleton) {
    reasons.push('缺少骨骼系统 - 无法进行骨骼动画');
  }

  if (!info.hasMorphTargets) {
    reasons.push('缺少 Morph Targets - 无法进行面部表情动画');
  }

  if (info.boneCount < 10 && info.hasSkeleton) {
    reasons.push(`骨骼数量较少 (${info.boneCount}) - 可能是简化模型`);
  }

  return {
    ready: info.hasSkeleton || info.hasMorphTargets,
    reasons: reasons.length > 0 ? reasons : ['模型已准备好进行动画！']
  };
}

