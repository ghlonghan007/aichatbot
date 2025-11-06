import * as THREE from 'three';
import { setMorphTarget, MORPH_TARGETS } from './morphTargets';

/**
 * 唇形同步控制器
 */
export class LipSyncController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private model: THREE.Group | null = null;
  private animationId: number | null = null;

  constructor(model: THREE.Group) {
    this.model = model;
  }

  /**
   * 从音频元素开始唇形同步
   */
  startFromAudio(audioElement: HTMLAudioElement): void {
    this.stop();

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaElementSource(audioElement);
    this.analyser = this.audioContext.createAnalyser();
    
    this.analyser.fftSize = 256;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.animate();
  }

  /**
   * 从麦克风输入开始唇形同步
   */
  async startFromMicrophone(): Promise<void> {
    this.stop();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    
    this.analyser.fftSize = 256;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    source.connect(this.analyser);

    this.animate();
  }

  /**
   * 简单的嘴型同步（基于说话状态）
   */
  startSimple(isSpeaking: boolean): void {
    if (!this.model) return;

    const animate = () => {
      if (!this.model) return;

      if (isSpeaking) {
        const time = Date.now() / 1000;
        // 随机变化的嘴型
        const mouthOpen = 0.3 + Math.abs(Math.sin(time * 8)) * 0.4;
        const jawOpen = mouthOpen * 0.6;
        
        setMorphTarget(this.model, MORPH_TARGETS.mouthOpen, mouthOpen);
        setMorphTarget(this.model, MORPH_TARGETS.jawOpen, jawOpen);
      } else {
        setMorphTarget(this.model, MORPH_TARGETS.mouthOpen, 0);
        setMorphTarget(this.model, MORPH_TARGETS.jawOpen, 0);
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * 动画循环
   */
  private animate = (): void => {
    if (!this.analyser || !this.dataArray || !this.model) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    // 计算音量（平均频率强度）
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;
    const volume = average / 255; // 归一化到 0-1

    // 根据音量控制嘴巴张开程度
    const mouthOpen = THREE.MathUtils.clamp(volume * 2, 0, 1);
    const jawOpen = mouthOpen * 0.6;

    setMorphTarget(this.model, MORPH_TARGETS.mouthOpen, mouthOpen);
    setMorphTarget(this.model, MORPH_TARGETS.jawOpen, jawOpen);

    // 分析不同频段实现更真实的嘴型
    const lowFreq = this.getFrequencyRange(0, 10); // 低频
    const midFreq = this.getFrequencyRange(10, 50); // 中频
    const highFreq = this.getFrequencyRange(50, 100); // 高频

    // 根据频段调整嘴型
    if (midFreq > 0.3) {
      setMorphTarget(this.model, MORPH_TARGETS.mouthSmile, midFreq * 0.3);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  /**
   * 获取特定频段的平均值
   */
  private getFrequencyRange(start: number, end: number): number {
    if (!this.dataArray) return 0;

    let sum = 0;
    const count = end - start;
    for (let i = start; i < end && i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    return (sum / count) / 255;
  }

  /**
   * 停止唇形同步
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;

    // 重置嘴型
    if (this.model) {
      setMorphTarget(this.model, MORPH_TARGETS.mouthOpen, 0);
      setMorphTarget(this.model, MORPH_TARGETS.jawOpen, 0);
      setMorphTarget(this.model, MORPH_TARGETS.mouthSmile, 0);
    }
  }

  /**
   * 更新模型引用
   */
  setModel(model: THREE.Group): void {
    this.model = model;
  }
}

