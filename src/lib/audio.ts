import { useCallback, useEffect, useRef, useState } from 'react';

type VADOptions = {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  threshold?: number;
  smoothing?: number;
};

export function useMicrophoneVAD(options: VADOptions = {}) {
  const {
    onSpeechStart,
    onSpeechEnd,
    threshold = 0.02,
    smoothing = 0.8,
  } = options;

  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isSpeechRef = useRef(false);
  const rafRef = useRef<number>(0);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = smoothing;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setIsActive(true);

      // VAD loop
      const dataArray = new Uint8Array(analyser.fftSize);
      const loop = () => {
        if (!analyserRef.current) return;
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const isSpeaking = rms > threshold;

        if (isSpeaking && !isSpeechRef.current) {
          isSpeechRef.current = true;
          onSpeechStart?.();
        } else if (!isSpeaking && isSpeechRef.current) {
          isSpeechRef.current = false;
          onSpeechEnd?.();
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      console.error('Microphone access denied', e);
    }
  }, [onSpeechStart, onSpeechEnd, threshold, smoothing]);

  const stopMic = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    isSpeechRef.current = false;
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  return { startMic, stopMic, isActive, onSpeechStart, onSpeechEnd };
}

