import { useCallback, useState } from 'react';
import * as THREE from 'three';

type AvatarParams = {
  headSize: number;
  headShape: 'sphere' | 'box' | 'cone';
  eyeSize: number;
  eyeSpacing: number;
  mouthWidth: number;
  mouthHeight: number;
  skinColor: string;
  eyeColor: string;
  hasHair: boolean;
  hairColor: string;
  bodyType: 'none' | 'simple' | 'humanoid';
};

type Props = {
  onModelCreated: (model: THREE.Group) => void;
};

export default function ProceduralAvatarCreator({ onModelCreated }: Props) {
  const [params, setParams] = useState<AvatarParams>({
    headSize: 0.8,
    headShape: 'sphere',
    eyeSize: 0.1,
    eyeSpacing: 0.25,
    mouthWidth: 0.3,
    mouthHeight: 0.08,
    skinColor: '#f3e5ab',
    eyeColor: '#222222',
    hasHair: true,
    hairColor: '#8b4513',
    bodyType: 'simple',
  });

  const [showCreator, setShowCreator] = useState(false);

  const createModel = useCallback(() => {
    const group = new THREE.Group();

    // 头部
    let headGeom: THREE.BufferGeometry;
    switch (params.headShape) {
      case 'box':
        headGeom = new THREE.BoxGeometry(params.headSize * 1.2, params.headSize * 1.2, params.headSize * 1.2);
        break;
      case 'cone':
        headGeom = new THREE.ConeGeometry(params.headSize, params.headSize * 1.5, 32);
        break;
      default:
        headGeom = new THREE.SphereGeometry(params.headSize, 48, 48);
    }

    const headMat = new THREE.MeshStandardMaterial({ 
      color: params.skinColor, 
      roughness: 0.6, 
      metalness: 0.1 
    });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.set(0, 1, 0);
    head.name = 'Head';
    group.add(head);

    // 眼睛
    const eyeGeom = new THREE.SphereGeometry(params.eyeSize, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: params.eyeColor });
    
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-params.eyeSpacing, 1.15, params.headSize * 0.88);
    leftEye.name = 'Eye_L';
    
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(params.eyeSpacing, 1.15, params.headSize * 0.88);
    rightEye.name = 'Eye_R';
    
    const eyes = new THREE.Group();
    eyes.name = 'Eyes';
    eyes.add(leftEye, rightEye);
    group.add(eyes);

    // 嘴巴
    const mouthGeom = new THREE.BoxGeometry(params.mouthWidth, params.mouthHeight, 0.1);
    const mouthMat = new THREE.MeshStandardMaterial({ color: '#222222' });
    const mouth = new THREE.Mesh(mouthGeom, mouthMat);
    mouth.position.set(0, 0.75, params.headSize * 0.98);
    mouth.name = 'Mouth';
    group.add(mouth);

    // 头发（可选）
    if (params.hasHair) {
      const hairGeom = new THREE.SphereGeometry(params.headSize * 1.05, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const hairMat = new THREE.MeshStandardMaterial({ 
        color: params.hairColor, 
        roughness: 0.9 
      });
      const hair = new THREE.Mesh(hairGeom, hairMat);
      hair.position.set(0, 1.3, 0);
      hair.name = 'Hair';
      group.add(hair);
    }

    // 身体（可选）
    if (params.bodyType === 'simple') {
      const bodyGeom = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 32);
      const bodyMat = new THREE.MeshStandardMaterial({ 
        color: '#4a90e2', 
        roughness: 0.7 
      });
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      body.position.set(0, 0.2, 0);
      body.name = 'Body';
      group.add(body);
    } else if (params.bodyType === 'humanoid') {
      // 躯干
      const torsoGeom = new THREE.BoxGeometry(0.8, 1.0, 0.4);
      const torsoMat = new THREE.MeshStandardMaterial({ color: '#4a90e2' });
      const torso = new THREE.Mesh(torsoGeom, torsoMat);
      torso.position.set(0, 0.3, 0);
      group.add(torso);

      // 手臂
      const armGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 16);
      const armMat = new THREE.MeshStandardMaterial({ color: params.skinColor });
      
      const leftArm = new THREE.Mesh(armGeom, armMat);
      leftArm.position.set(-0.5, 0.3, 0);
      leftArm.rotation.z = Math.PI / 8;
      
      const rightArm = new THREE.Mesh(armGeom, armMat);
      rightArm.position.set(0.5, 0.3, 0);
      rightArm.rotation.z = -Math.PI / 8;
      
      group.add(leftArm, rightArm);
    }

    return group;
  }, [params]);

  const handleCreate = useCallback(() => {
    const model = createModel();
    onModelCreated(model);
    setShowCreator(false);
  }, [createModel, onModelCreated]);

  const updateParam = <K extends keyof AvatarParams>(key: K, value: AvatarParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  if (!showCreator) {
    return (
      <button
        onClick={() => setShowCreator(true)}
        style={{
          padding: '8px 12px',
          background: '#9b59b6',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          width: '100%',
        }}
      >
        🎨 程序化角色生成器
      </button>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.8)', 
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 8, 
        padding: 24, 
        maxWidth: 500,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <h3 style={{ marginTop: 0 }}>🎨 程序化角色生成器</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 头部大小 */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              头部大小: {params.headSize.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={params.headSize}
              onChange={(e) => updateParam('headSize', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* 头部形状 */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>头部形状</label>
            <select 
              value={params.headShape} 
              onChange={(e) => updateParam('headShape', e.target.value as any)}
              style={{ width: '100%', padding: 8, borderRadius: 4 }}
            >
              <option value="sphere">球形</option>
              <option value="box">方形</option>
              <option value="cone">锥形</option>
            </select>
          </div>

          {/* 眼睛大小 */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              眼睛大小: {params.eyeSize.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.05"
              max="0.2"
              step="0.01"
              value={params.eyeSize}
              onChange={(e) => updateParam('eyeSize', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* 眼距 */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              眼距: {params.eyeSpacing.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.15"
              max="0.4"
              step="0.01"
              value={params.eyeSpacing}
              onChange={(e) => updateParam('eyeSpacing', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* 嘴巴宽度 */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              嘴巴宽度: {params.mouthWidth.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.2"
              max="0.6"
              step="0.05"
              value={params.mouthWidth}
              onChange={(e) => updateParam('mouthWidth', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* 肤色 */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>肤色</label>
            <input
              type="color"
              value={params.skinColor}
              onChange={(e) => updateParam('skinColor', e.target.value)}
              style={{ width: '100%', height: 40, cursor: 'pointer' }}
            />
          </div>

          {/* 眼睛颜色 */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>眼睛颜色</label>
            <input
              type="color"
              value={params.eyeColor}
              onChange={(e) => updateParam('eyeColor', e.target.value)}
              style={{ width: '100%', height: 40, cursor: 'pointer' }}
            />
          </div>

          {/* 头发 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={params.hasHair}
                onChange={(e) => updateParam('hasHair', e.target.checked)}
              />
              <span style={{ fontSize: 14, fontWeight: 600 }}>添加头发</span>
            </label>
          </div>

          {params.hasHair && (
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>头发颜色</label>
              <input
                type="color"
                value={params.hairColor}
                onChange={(e) => updateParam('hairColor', e.target.value)}
                style={{ width: '100%', height: 40, cursor: 'pointer' }}
              />
            </div>
          )}

          {/* 身体类型 */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>身体类型</label>
            <select 
              value={params.bodyType} 
              onChange={(e) => updateParam('bodyType', e.target.value as any)}
              style={{ width: '100%', padding: 8, borderRadius: 4 }}
            >
              <option value="none">无身体</option>
              <option value="simple">简单</option>
              <option value="humanoid">人形</option>
            </select>
          </div>

          {/* 按钮 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={handleCreate}
              style={{
                flex: 1,
                padding: '12px',
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ✅ 创建角色
            </button>
            <button
              onClick={() => setShowCreator(false)}
              style={{
                flex: 1,
                padding: '12px',
                background: '#999',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

