import { useCallback, useEffect, useRef, useState } from 'react';

export default function ScreenCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [active, setActive] = useState(false);

  const start = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setStream(s);
      setActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (e) {
      // 用户取消或权限失败
    }
  }, []);

  const stop = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setActive(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={active ? stop : start}>{active ? '停止桌面预览' : '开始桌面预览'}</button>
      </div>
      <video ref={videoRef} style={{ width: '100%', borderRadius: 6, border: '1px solid #eee' }} muted playsInline />
    </div>
  );
}


