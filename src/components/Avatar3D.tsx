import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { 
  setMorphTarget, 
  blinkEyes, 
  animateMouthSpeaking,
  MORPH_TARGETS,
  getAvailableMorphTargets 
} from '../lib/morphTargets';

export type AvatarModel = 'default' | 'robot' | 'cat' | 'cute' | 'professional';

type Props = {
  speaking?: boolean;
  listening?: boolean;
  model?: AvatarModel;
  customModel?: THREE.Group | null;
  enableControls?: boolean;
};

type AvatarParts = {
  group: THREE.Group;
  head: THREE.Mesh;
  mouth: THREE.Mesh | THREE.Group | THREE.Line;
  eyes?: THREE.Group;
  extras?: THREE.Object3D[];
};

function createDefaultAvatar(): AvatarParts {
  const group = new THREE.Group();
  
  const headGeom = new THREE.SphereGeometry(0.8, 48, 48);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf3e5ab, roughness: 0.6, metalness: 0.1 });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.set(0, 1, 0);
  
  const mouthGeom = new THREE.BoxGeometry(0.3, 0.08, 0.1);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const mouth = new THREE.Mesh(mouthGeom, mouthMat);
  mouth.position.set(0, 0.75, 0.78);
  
  const eyeGeom = new THREE.SphereGeometry(0.1, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.25, 1.15, 0.7);
  const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(0.25, 1.15, 0.7);
  
  const eyes = new THREE.Group();
  eyes.add(leftEye, rightEye);
  
  group.add(head, mouth, eyes);
  return { group, head, mouth, eyes };
}

function createRobotAvatar(): AvatarParts {
  const group = new THREE.Group();
  
  // 机器人方形头部
  const headGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const headMat = new THREE.MeshStandardMaterial({ 
    color: 0x4a90e2, 
    roughness: 0.3, 
    metalness: 0.8 
  });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.set(0, 1, 0);
  
  // 天线
  const antennaGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
  const antennaMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b, metalness: 0.9 });
  const antenna = new THREE.Mesh(antennaGeom, antennaMat);
  antenna.position.set(0, 1.85, 0);
  
  // LED 眼睛
  const eyeGeom = new THREE.BoxGeometry(0.25, 0.15, 0.1);
  const eyeMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ff88, 
    emissive: 0x00ff88, 
    emissiveIntensity: 0.8 
  });
  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.35, 1.15, 0.61);
  const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(0.35, 1.15, 0.61);
  
  const eyes = new THREE.Group();
  eyes.add(leftEye, rightEye);
  
  // 嘴部显示屏
  const mouthGeom = new THREE.BoxGeometry(0.6, 0.12, 0.1);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const mouth = new THREE.Mesh(mouthGeom, mouthMat);
  mouth.position.set(0, 0.7, 0.61);
  
  group.add(head, mouth, eyes, antenna);
  return { group, head, mouth, eyes, extras: [antenna] };
}

function createCatAvatar(): AvatarParts {
  const group = new THREE.Group();
  
  // 猫头
  const headGeom = new THREE.SphereGeometry(0.7, 32, 32);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffa94d, roughness: 0.8 });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.set(0, 1, 0);
  head.scale.set(1, 0.95, 1.1);
  
  // 猫耳朵
  const earGeom = new THREE.ConeGeometry(0.25, 0.5, 4);
  const earMat = new THREE.MeshStandardMaterial({ color: 0xffa94d });
  const leftEar = new THREE.Mesh(earGeom, earMat);
  leftEar.position.set(-0.45, 1.6, 0);
  leftEar.rotation.z = -0.3;
  const rightEar = new THREE.Mesh(earGeom, earMat);
  rightEar.position.set(0.45, 1.6, 0);
  rightEar.rotation.z = 0.3;
  
  // 猫眼睛
  const eyeGeom = new THREE.SphereGeometry(0.12, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x90ee90, emissive: 0x228b22, emissiveIntensity: 0.3 });
  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.22, 1.1, 0.65);
  leftEye.scale.set(1, 1.3, 0.8);
  const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(0.22, 1.1, 0.65);
  rightEye.scale.set(1, 1.3, 0.8);
  
  const eyes = new THREE.Group();
  eyes.add(leftEye, rightEye);
  
  // 猫嘴
  const mouthGroup = new THREE.Group();
  const mouthGeom = new THREE.SphereGeometry(0.15, 16, 16, 0, Math.PI);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
  const mouthMesh = new THREE.Mesh(mouthGeom, mouthMat);
  mouthMesh.rotation.x = Math.PI / 2;
  mouthMesh.position.set(0, 0.7, 0.68);
  mouthGroup.add(mouthMesh);
  
  // 鼻子
  const noseGeom = new THREE.SphereGeometry(0.08, 16, 16);
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xff1493 });
  const nose = new THREE.Mesh(noseGeom, noseMat);
  nose.position.set(0, 0.85, 0.7);
  
  group.add(head, leftEar, rightEar, eyes, mouthGroup, nose);
  return { group, head, mouth: mouthGroup, eyes, extras: [leftEar, rightEar, nose] };
}

function createCuteAvatar(): AvatarParts {
  const group = new THREE.Group();
  
  // 可爱圆头
  const headGeom = new THREE.SphereGeometry(0.85, 48, 48);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.5 });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.set(0, 1, 0);
  
  // 大眼睛
  const eyeWhiteGeom = new THREE.SphereGeometry(0.2, 24, 24);
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
  leftEyeWhite.position.set(-0.3, 1.15, 0.75);
  const rightEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
  rightEyeWhite.position.set(0.3, 1.15, 0.75);
  
  const pupilGeom = new THREE.SphereGeometry(0.1, 16, 16);
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const leftPupil = new THREE.Mesh(pupilGeom, pupilMat);
  leftPupil.position.set(-0.3, 1.15, 0.92);
  const rightPupil = new THREE.Mesh(pupilGeom, pupilMat);
  rightPupil.position.set(0.3, 1.15, 0.92);
  
  const eyes = new THREE.Group();
  eyes.add(leftEyeWhite, rightEyeWhite, leftPupil, rightPupil);
  
  // 微笑嘴巴
  const mouthCurve = new THREE.EllipseCurve(0, 0, 0.3, 0.2, Math.PI, 2 * Math.PI, false, 0);
  const points = mouthCurve.getPoints(32);
  const mouthGeom = new THREE.BufferGeometry().setFromPoints(points);
  const mouthMat = new THREE.LineBasicMaterial({ color: 0xff69b4, linewidth: 3 });
  const mouth = new THREE.Line(mouthGeom, mouthMat);
  mouth.position.set(0, 0.65, 0.82);
  mouth.rotation.x = Math.PI / 2;
  
  // 腮红
  const blushGeom = new THREE.SphereGeometry(0.15, 16, 16);
  const blushMat = new THREE.MeshStandardMaterial({ 
    color: 0xff6b9d, 
    transparent: true, 
    opacity: 0.6 
  });
  const leftBlush = new THREE.Mesh(blushGeom, blushMat);
  leftBlush.position.set(-0.6, 0.9, 0.5);
  leftBlush.scale.set(1, 0.6, 0.5);
  const rightBlush = new THREE.Mesh(blushGeom, blushMat);
  rightBlush.position.set(0.6, 0.9, 0.5);
  rightBlush.scale.set(1, 0.6, 0.5);
  
  group.add(head, eyes, mouth, leftBlush, rightBlush);
  return { group, head, mouth, eyes, extras: [leftBlush, rightBlush] };
}

function createProfessionalAvatar(): AvatarParts {
  const group = new THREE.Group();
  
  // 专业头部
  const headGeom = new THREE.SphereGeometry(0.75, 48, 48);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.set(0, 1, 0);
  
  // 眼镜
  const glassFrameGeom = new THREE.TorusGeometry(0.15, 0.02, 8, 24);
  const glassFrameMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
  const leftGlass = new THREE.Mesh(glassFrameGeom, glassFrameMat);
  leftGlass.position.set(-0.28, 1.1, 0.7);
  leftGlass.rotation.y = Math.PI / 2;
  const rightGlass = new THREE.Mesh(glassFrameGeom, glassFrameMat);
  rightGlass.position.set(0.28, 1.1, 0.7);
  rightGlass.rotation.y = Math.PI / 2;
  
  const bridgeGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.15);
  const bridge = new THREE.Mesh(bridgeGeom, glassFrameMat);
  bridge.position.set(0, 1.1, 0.72);
  bridge.rotation.z = Math.PI / 2;
  
  const eyes = new THREE.Group();
  eyes.add(leftGlass, rightGlass, bridge);
  
  // 嘴巴
  const mouthGeom = new THREE.BoxGeometry(0.25, 0.05, 0.1);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const mouth = new THREE.Mesh(mouthGeom, mouthMat);
  mouth.position.set(0, 0.72, 0.73);
  
  // 领带（装饰）
  const tieGeom = new THREE.ConeGeometry(0.15, 0.4, 4);
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
  const tie = new THREE.Mesh(tieGeom, tieMat);
  tie.position.set(0, 0.15, 0.3);
  
  group.add(head, eyes, mouth, tie);
  return { group, head, mouth, eyes, extras: [tie] };
}

export default function Avatar3D({ speaking, listening, model = 'default', customModel, enableControls = false }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const avatarPartsRef = useRef<AvatarParts | null>(null);
  const customModelRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lastBlinkTime = useRef<number>(0);
  const currentModelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(2, 4, 3);
    scene.add(dir);

    // 根据模型类型创建头像
    let avatarParts: AvatarParts | null = null;
    
    if (customModel) {
      // 使用自定义模型
      const clonedModel = customModel.clone();
      customModelRef.current = clonedModel;
      currentModelRef.current = clonedModel;
      scene.add(clonedModel);
      
      // 打印模型支持的 Morph Targets
      const availableTargets = getAvailableMorphTargets(clonedModel);
      console.log('🎭 模型支持的 Morph Targets:', availableTargets);
      
      // 尝试查找头部和嘴部（用于动画）
      let head: THREE.Mesh | null = null;
      let mouth: THREE.Mesh | null = null;
      
      clonedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const name = child.name.toLowerCase();
          if (name.includes('head') || name.includes('face')) {
            head = child;
          }
          if (name.includes('mouth') || name.includes('jaw')) {
            mouth = child;
          }
        }
      });
      
      // 如果没找到特定部分，使用整个模型作为头部
      if (!head) {
        head = clonedModel.children[0] as THREE.Mesh;
      }
      if (!mouth) {
        mouth = head; // 回退到头部
      }
      
      avatarParts = {
        group: clonedModel,
        head: head || new THREE.Mesh(),
        mouth: mouth || new THREE.Mesh(),
      };
    } else {
      // 使用内置模型
      switch (model) {
        case 'robot':
          avatarParts = createRobotAvatar();
          break;
        case 'cat':
          avatarParts = createCatAvatar();
          break;
        case 'cute':
          avatarParts = createCuteAvatar();
          break;
        case 'professional':
          avatarParts = createProfessionalAvatar();
          break;
        default:
          avatarParts = createDefaultAvatar();
      }
      scene.add(avatarParts.group);
    }

    avatarPartsRef.current = avatarParts;

    // 地板
    const floorGeom = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f8 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // 添加轨道控制器
    let controls: OrbitControls | null = null;
    if (enableControls) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 1;
      controls.maxDistance = 10;
      controls.maxPolarAngle = Math.PI / 2;
      controls.enablePan = true; // 启用平移
      controlsRef.current = controls;
    }

    // 键盘控制人物平移
    const keyState = { 
      ArrowUp: false, 
      ArrowDown: false, 
      ArrowLeft: false, 
      ArrowRight: false,
      KeyQ: false,  // 升高
      KeyE: false,  // 降低
      PageUp: false,    // 升高（备选）
      PageDown: false   // 降低（备选）
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key in keyState ? e.key : e.code;
      if (key in keyState) {
        keyState[key as keyof typeof keyState] = true;
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key in keyState ? e.key : e.code;
      if (key in keyState) {
        keyState[key as keyof typeof keyState] = false;
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let raf = 0;
    const clock = new THREE.Clock();
    const moveSpeed = 0.05; // 移动速度
    
    const animate = () => {
      const t = clock.getElapsedTime();
      
      // 更新控制器
      if (controls) {
        controls.update();
      }
      
      // 键盘控制人物位置
      if (avatarParts && enableControls) {
        const { group } = avatarParts;
        
        // 前后左右移动
        if (keyState.ArrowUp) {
          group.position.z -= moveSpeed;
        }
        if (keyState.ArrowDown) {
          group.position.z += moveSpeed;
        }
        if (keyState.ArrowLeft) {
          group.position.x -= moveSpeed;
        }
        if (keyState.ArrowRight) {
          group.position.x += moveSpeed;
        }
        
        // 升高降低
        if (keyState.KeyQ || keyState.PageUp) {
          group.position.y += moveSpeed;
        }
        if (keyState.KeyE || keyState.PageDown) {
          group.position.y -= moveSpeed;
        }
      }
      
      const { head, mouth, eyes } = avatarParts;

      // === 使用 Morph Targets 的动画（Ready Player Me 模型）===
      if (currentModelRef.current) {
        // 嘴巴说话动画（使用 Morph Targets）
        if (speaking) {
          animateMouthSpeaking(currentModelRef.current, 0.7);
        } else {
          setMorphTarget(currentModelRef.current, MORPH_TARGETS.mouthOpen, 0);
          setMorphTarget(currentModelRef.current, MORPH_TARGETS.jawOpen, 0);
        }

        // 眨眼动画（每 3-5 秒随机眨一次）
        if (t - lastBlinkTime.current > 3 + Math.random() * 2) {
          blinkEyes(currentModelRef.current);
          lastBlinkTime.current = t;
        }

        // 监听时微笑
        if (listening) {
          setMorphTarget(currentModelRef.current, MORPH_TARGETS.mouthSmile, 0.3);
          setMorphTarget(currentModelRef.current, MORPH_TARGETS.eyeWideLeft, 0.2);
          setMorphTarget(currentModelRef.current, MORPH_TARGETS.eyeWideRight, 0.2);
        } else {
          setMorphTarget(currentModelRef.current, MORPH_TARGETS.mouthSmile, 0);
          setMorphTarget(currentModelRef.current, MORPH_TARGETS.eyeWideLeft, 0);
          setMorphTarget(currentModelRef.current, MORPH_TARGETS.eyeWideRight, 0);
        }
      }

      // === 旧版几何体动画（兼容简单模型）===
      // 头部轻微摇摆（仅在未启用控制器时）
      if (!enableControls) {
        head.rotation.y = Math.sin(t * 0.5) * 0.1;
      }
      
      // 呼吸效果
      const breathY = head.position.y || 1;
      head.position.y = (model === 'cat' ? 1 : 1) + Math.sin(t * 1.2) * 0.02;

      // 嘴部动画（说话时张合） - 简单模型
      if (mouth && !currentModelRef.current) {
        if (mouth instanceof THREE.Mesh) {
          const mouthOpen = speaking ? (0.08 + Math.abs(Math.sin(t * 10)) * 0.18) : 0.08;
          mouth.scale.y = THREE.MathUtils.lerp(mouth.scale.y || 1, (mouthOpen / 0.08), 0.2);
        } else if (mouth instanceof THREE.Group && speaking) {
          mouth.position.y = 0.7 + Math.abs(Math.sin(t * 10)) * 0.05;
        }
      }

      // 监听时的脉冲效果 - 简单模型
      if (!currentModelRef.current) {
        const pulse = listening ? (0.9 + Math.sin(t * 6) * 0.1) : 1.0;
        const headMat = head.material as THREE.MeshStandardMaterial;
        if (listening) {
          headMat.emissive = new THREE.Color(0xff66cc).multiplyScalar(0.2 * pulse);
        } else {
          headMat.emissive = new THREE.Color(0x000000);
        }
      }

      // 眼睛眨眼（随机） - 简单模型
      if (eyes && !currentModelRef.current && Math.random() < 0.005) {
        eyes.scale.y = 0.1;
        setTimeout(() => {
          if (eyes) eyes.scale.y = 1;
        }, 100);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 360;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(raf);
      if (controls) {
        controls.dispose();
      }
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [speaking, listening, model, customModel, enableControls]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
