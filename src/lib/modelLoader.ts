import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { DRACOLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';

export type ModelFormat = 'gltf' | 'glb' | 'fbx' | 'obj' | 'vrm';

// 创建并配置 Draco 加载器（单例）
let dracoLoader: DRACOLoader | null = null;

function getDracoLoader(): DRACOLoader {
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    // 使用 CDN 上的 Draco 解码器
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.preload();
  }
  return dracoLoader;
}

/**
 * 加载 GLTF/GLB 模型
 */
export async function loadGLTFModel(url: string | File): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  
  // 设置 Draco 解码器
  loader.setDRACOLoader(getDracoLoader());
  
  return new Promise((resolve, reject) => {
    const loadUrl = typeof url === 'string' ? url : URL.createObjectURL(url);
    
    loader.load(
      loadUrl,
      (gltf) => {
        // 清理临时 URL
        if (typeof url !== 'string') {
          URL.revokeObjectURL(loadUrl);
        }
        
        const model = gltf.scene;
        
        // 自动居中和缩放模型
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // 居中
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // 缩放到合适大小（假设目标高度为 2）
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
        
        resolve(model);
      },
      undefined,
      (error) => {
        if (typeof url !== 'string') {
          URL.revokeObjectURL(loadUrl);
        }
        reject(error);
      }
    );
  });
}

/**
 * 加载 FBX 模型
 */
export async function loadFBXModel(url: string | File): Promise<THREE.Group> {
  const loader = new FBXLoader();
  
  return new Promise((resolve, reject) => {
    const loadUrl = typeof url === 'string' ? url : URL.createObjectURL(url);
    
    loader.load(
      loadUrl,
      (fbx) => {
        if (typeof url !== 'string') {
          URL.revokeObjectURL(loadUrl);
        }
        
        // 自动居中和缩放
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        fbx.position.x = -center.x;
        fbx.position.y = -center.y;
        fbx.position.z = -center.z;
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        fbx.scale.setScalar(scale);
        
        resolve(fbx);
      },
      undefined,
      (error) => {
        if (typeof url !== 'string') {
          URL.revokeObjectURL(loadUrl);
        }
        reject(error);
      }
    );
  });
}

/**
 * 加载 OBJ 模型
 */
export async function loadOBJModel(url: string | File): Promise<THREE.Group> {
  const loader = new OBJLoader();
  
  return new Promise((resolve, reject) => {
    const loadUrl = typeof url === 'string' ? url : URL.createObjectURL(url);
    
    loader.load(
      loadUrl,
      (obj) => {
        if (typeof url !== 'string') {
          URL.revokeObjectURL(loadUrl);
        }
        
        // 自动居中和缩放
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        obj.position.x = -center.x;
        obj.position.y = -center.y;
        obj.position.z = -center.z;
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        obj.scale.setScalar(scale);
        
        resolve(obj);
      },
      undefined,
      (error) => {
        if (typeof url !== 'string') {
          URL.revokeObjectURL(loadUrl);
        }
        reject(error);
      }
    );
  });
}

/**
 * 根据文件扩展名自动选择加载器
 */
export async function loadModel(urlOrFile: string | File): Promise<THREE.Group> {
  let extension: string;
  
  if (typeof urlOrFile === 'string') {
    extension = urlOrFile.split('.').pop()?.toLowerCase() || '';
  } else {
    extension = urlOrFile.name.split('.').pop()?.toLowerCase() || '';
  }
  
  switch (extension) {
    case 'gltf':
    case 'glb':
      return loadGLTFModel(urlOrFile);
    case 'fbx':
      return loadFBXModel(urlOrFile);
    case 'obj':
      return loadOBJModel(urlOrFile);
    default:
      throw new Error(`不支持的模型格式: ${extension}`);
  }
}

/**
 * 从 URL 列表中查找模型中的特定部分（用于动画）
 */
export function findMeshByName(model: THREE.Group, name: string): THREE.Mesh | null {
  let found: THREE.Mesh | null = null;
  
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.name.toLowerCase().includes(name.toLowerCase())) {
      found = child;
    }
  });
  
  return found;
}

/**
 * 获取模型的所有动画
 */
export function getModelAnimations(model: any): THREE.AnimationClip[] {
  if (model.animations && Array.isArray(model.animations)) {
    return model.animations;
  }
  return [];
}

/**
 * 清理 Draco 加载器（释放资源）
 */
export function disposeDracoLoader(): void {
  if (dracoLoader) {
    dracoLoader.dispose();
    dracoLoader = null;
  }
}

